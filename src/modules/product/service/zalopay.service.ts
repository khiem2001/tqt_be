import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { OrderRepository, ProductRepository } from '../repository';
import { OrderEntity } from 'common/entity';
import { OrderStatus, PaymentType } from 'enum/order.enum';
import { currencyFormatter } from 'util/format';
import { convertToObjectId } from 'util/convert-to-objectId';

@Injectable()
export class ZaloPayService {
  private readonly zalo_pay_end_point: string;
  private readonly app_id: number;
  private readonly app_user: string;
  private readonly redirect_url: string;
  private readonly callback_url: string;
  private readonly zalo_key: string;
  private readonly zalo_key_2: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly _orderRepository: OrderRepository,
    private readonly _productRepository: ProductRepository,
  ) {
    this.zalo_pay_end_point = this.configService.get('ZALO_PAY_API_END_POINT');
    this.app_id = parseFloat(this.configService.get('ZALO_PAY_APP_ID'));
    this.app_user = this.configService.get('ZALO_PAY_APP_USER');
    this.redirect_url = this.configService.get('ZALO_PAY_REDIRECT_URL');
    this.callback_url = this.configService.get('ZALO_PAY_CALL_BACK_URL');
    this.zalo_key = this.configService.get('ZALO_PAY_APP_KEY');
    this.zalo_key_2 = this.configService.get('ZALO_PAY_APP_KEY_2');
  }

  async createPaymentURL(order: OrderEntity, paymentType: PaymentType) {
    const { items, amount } = order;
    const formatAmount = currencyFormatter(order.amount);
    const date = new Date();

    const app_id = this.app_id;
    const app_user = this.app_user;
    const app_trans_id = `${date.getFullYear().toString().substring(2)}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${
      order._id
    }`;
    const embed_data = JSON.stringify({
      bankgroup: paymentType,
      redirecturl: this.redirect_url,
    });
    const app_items = JSON.stringify(items);
    const app_time = new Date().getTime();
    const callback_url = this.callback_url;

    const data: any = {
      app_id,
      app_user,
      app_trans_id,
      app_time,
      amount,
      item: app_items,
      description: `Thanh toán đơn hàng #${order.code}. Số tiền ${formatAmount}`,
      bank_code: '',
      embed_data,
      callback_url,
    };
    const dataStr = `${app_id}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${app_items}`;

    const hmac = crypto.createHmac('sha256', this.zalo_key);
    const mac = hmac.update(dataStr).digest('hex');
    data.mac = mac;

    try {
      const response = await axios.post(
        `${this.zalo_pay_end_point}/create`,
        data,
      );

      //update order transaction
      await this._orderRepository.updateOrderTransaction(order._id, {
        gateway: 'zalopay',
        id: app_trans_id,
        time: new Date(app_time),
      });

      // console.log('response.data;', this.zalo_key, this.zalo_key_2);

      const { return_code, order_url, sub_return_message } = response.data;

      if (return_code === 1) {
        return {
          returnUrl: order_url,
        };
      }
      throw new Error(sub_return_message);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async callBackPaymentProcess({ data, mac, type }) {
    const parseData = JSON.parse(data);

    const { app_trans_id, amount, zp_trans_id, server_time } = parseData;
    const hmac = crypto.createHmac('sha256', this.zalo_key_2);
    const req_mac = hmac.update(data).digest('hex');

    if (req_mac === mac) {
      const orderId = app_trans_id.split('_')[1];
      // Mô tả Test case: Không tìm thấy giao dịch được confirm
      const order = await this._orderRepository.findOne({
        where: {
          _id: convertToObjectId(orderId),
        },
      });

      if (!order) {
        // refund
        await this.partialRefund({
          order_id: order._id,
          zp_trans_id,
          amount,
          description: 'Đơn hàng không tồn tại !',
        });
        return {
          return_code: 5,
          return_message: 'Đơn hàng không tồn tại !',
        };
      }
      //Mô tả Test case: Số tiền không hợp lệ
      if (order?.amount !== amount) {
        // refund
        await this.partialRefund({
          order_id: order._id,
          zp_trans_id,
          amount,
          description: 'Số tiền không hợp lệ !',
        });

        await this._orderRepository.updateOne(
          { _id: convertToObjectId(orderId) },
          {
            $set: {
              status: OrderStatus.FAILED,
            },
          },
        );
        return { return_code: 6, return_message: 'Số tiền không hợp lệ !' };
      }

      // Mô tả Test case: Giao dịch đã được confirm
      if (order?.status !== OrderStatus.PENDING) {
        // refund
        await this.partialRefund({
          order_id: order._id,
          zp_trans_id,
          amount,
          description: 'Đơn hàng đã được xử lý trước đó !',
        });
        return {
          return_code: 7,
          return_message: 'Đơn hàng đã được xử lý trước đó !',
        };
      }

      const { value } = await this._orderRepository.findOneAndUpdate(
        { _id: convertToObjectId(orderId) },
        {
          $set: {
            status: OrderStatus.COMPLETED,
          },
        },
        { returnOriginal: false },
      );

      value.items.map(
        async (obj) =>
          await this._productRepository.findOneAndUpdate(
            { _id: convertToObjectId(obj.id) },
            { $inc: { totalSold: obj.quantity } },
          ),
      );
      return { return_code: 1, return_message: 'Xử lý đơn hàng thành công !' };
    }

    return {
      return_code: 97,
      return_message: 'Failed checksum',
    };
  }
  async partialRefund({ order_id, zp_trans_id, amount, description }) {
    const string_zp_trans_id = zp_trans_id.toString();
    const app_id = this.app_id;
    const date = new Date();
    const m_refund_id = `${date.getFullYear().toString().substring(2)}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}${date
      .getDate()
      .toString()
      .padStart(2, '0')}_${app_id}_${order_id}`;
    const timestamp = new Date().getTime();
    const dataStr = `${app_id}|${string_zp_trans_id}|${amount}|${description}|${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.zalo_key);
    const mac = hmac.update(dataStr).digest('hex');

    const data: any = {
      m_refund_id,
      app_id,
      zp_trans_id: string_zp_trans_id,
      amount,
      timestamp,
      mac,
      description,
    };

    try {
      const response = await axios.post(
        `${this.zalo_pay_end_point}/refund`,
        data,
      );

      const { return_code, return_message } = response.data;

      return {
        return_code,
        return_message,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
