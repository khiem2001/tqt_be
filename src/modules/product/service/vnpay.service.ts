import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as querystring from 'qs';
import * as crypto from 'crypto';
import { OrderRepository, ProductRepository } from '../repository';
import { OrderEntity } from 'common/entity';
import { currencyFormatter } from 'util/format';
import { sortObject } from 'util/sortObject';
import { convertToObjectId } from 'util/convert-to-objectId';
import { OrderStatus } from 'enum/order.enum';

@Injectable()
export class VNPayService {
  constructor(
    private readonly configService: ConfigService,
    private readonly _orderRepository: OrderRepository,
    private readonly _productRepository: ProductRepository,
  ) {}

  async createPaymentURL(order: OrderEntity) {
    let vnpUrl = this.configService.get('VNP_URL');
    let vnpParams = {};

    const formatAmount = currencyFormatter(order.amount);

    vnpParams['vnp_Version'] = '2.1.0';
    vnpParams['vnp_Command'] = 'pay';
    vnpParams['vnp_TmnCode'] = this.configService.get('TMNCODE');
    vnpParams['vnp_Locale'] = 'vn';
    vnpParams['vnp_CurrCode'] = 'VND';
    vnpParams['vnp_TxnRef'] = order._id;
    vnpParams[
      'vnp_OrderInfo'
    ] = `Thanh toán đơn hàng #${order.code}. Số tiền ${formatAmount}`;
    vnpParams['vnp_OrderType'] = '190001';
    vnpParams['vnp_ReturnUrl'] = this.configService.get('RETURN_URL');
    vnpParams['vnp_IpAddr'] = '127.0.0.1';
    vnpParams['vnp_CreateDate'] = moment().format('YYYYMMDDHHmmss');
    vnpParams['vnp_Amount'] = order.amount * 100;

    vnpParams = sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac(
      'sha512',
      this.configService.get('SECRETKEY'),
    );
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(vnpParams, { encode: false });

    await this._orderRepository.updateOrderTransaction(order._id, {
      gateway: 'vnpay',
      id: order._id.toString(),
      time: new Date(),
    });

    return {
      returnUrl: vnpUrl,
    };
  }

  async callBackPaymentProcess(query: any) {
    const secureHash = query['vnp_SecureHash'];
    const secretKey = this.configService.get('SECRETKEY');
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];
    query = sortObject(query);
    const orderId = query['vnp_TxnRef'];
    const signData = querystring.stringify(query, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    try {
      if (secureHash === signed) {
        // Mô tả Test case: Không tìm thấy giao dịch được confirm
        const order = await this._orderRepository.findOne({
          where: {
            _id: convertToObjectId(query['vnp_TxnRef']),
          },
        });
        if (!order) return { Message: 'Order Not Found', RspCode: '01' };

        //Mô tả Test case: Số tiền không hợp lệ
        if (order?.amount !== query['vnp_Amount'] / 100)
          return { RspCode: '04', Message: 'Invalid amount' };

        // Mô tả Test case: Giao dịch đã được confirm
        if (order?.status !== OrderStatus.PENDING)
          return { RspCode: '02', Message: 'Order already confirmed' };

        // check response from VNPay
        switch (query['vnp_ResponseCode']) {
          case '00':
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

            return { RspCode: '00', Message: 'Confirm Success' };
          default:
            await this._orderRepository.updateOne(
              { _id: convertToObjectId(orderId) },
              {
                $set: {
                  status: OrderStatus.FAILED,
                },
              },
            );
        }
      }
      return {
        RspCode: '97',
        Message: 'Fail checksum',
      };
    } catch (error) {
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }
}
