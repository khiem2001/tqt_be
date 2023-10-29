import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePaymentInputDto,
  CreateProductInputDto,
  GetListProductInput,
  ReadProductInputDto,
  UpdateProductInputDto,
} from '../input';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import {
  GetListProductResponse,
  GetProductResponse,
  ListOrderResponse,
} from '../type';
import { BooleanPayload } from 'util/reponse';
import { currencyFormatter } from 'util/format';
import {
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  ShippingStatus,
} from 'enum/order.enum';
import {
  CartRepository,
  CommentRepository,
  OrderRepository,
  ProductFavoriteRepository,
  ProductRepository,
  TypeRepository,
} from '../repository';
import { FindNoSQL } from 'util/find.operator';
import {
  CartEntity,
  CommentEntity,
  OrderEntity,
  ProductEntity,
  ProductFavoriteEntity,
  TypeEntity,
} from 'common/entity';
import { ZaloPayService } from './zalopay.service';
import { VNPayService } from './vnpay.service';
import { convertToObjectId } from 'util/convert-to-objectId';
import { UserService } from 'modules/user/service';

@Injectable()
export class ProductService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _cartRepository: CartRepository,
    private readonly _orderRepository: OrderRepository,
    private readonly _commentRepository: CommentRepository,

    private readonly find: FindNoSQL,
    private readonly _zaloPayService: ZaloPayService,
    private readonly _vnPayService: VNPayService,
    private readonly _productFavoriteRepository: ProductFavoriteRepository,
    private readonly userService: UserService,
    private readonly _typeRepository: TypeRepository,
  ) {}

  /**
   * get Product function
   * @param input
   * @returns
   */
  async getProduct(input: ReadProductInputDto): Promise<GetProductResponse> {
    const product = await this._productRepository.findById(input.productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại !');
    }

    return {
      product,
    } as unknown as GetProductResponse;
  }
  /**
   * get ListProduct function
   * @param input
   * @returns
   */
  async getListProduct(
    input: GetListProductInput,
  ): Promise<GetListProductResponse> {
    const { query: queryProduct, filter, pagination } = input;
    const { limit, page } = pagination;
    const offset = (page - 1) * limit;
    const where: any = {
      ...filter,
      deletedAt: null,
    };

    if (queryProduct) {
      where.name_contains = queryProduct;
    }

    const orderBy = 'createdAt_DESC';

    const option = this.find.getOption({
      limit,
      offset,
      where,
      orderBy,
    });

    const result = await this._productRepository.findAndCount({
      ...option,
    });
    const [data, totalCount] = result;

    return {
      products: data || [],
      totalItem: totalCount,
      pagination: {
        currentPage: page,
        totalPage: Math.ceil(totalCount / limit),
        pageSize: limit,
      },
    } as unknown as GetListProductResponse;
  }
  /**
   * create Product function
   * @param input
   * @returns
   */
  async createProduct(input: CreateProductInputDto) {
    const productExist = await this._productRepository.findOne({
      where: {
        name: input.name,
        $or: [
          { deletedAt: null },
          {
            deletedAt: { $gt: new Date() },
          },
        ],
      },
    });
    if (productExist) {
      throw new Error('Sản phẩm đã tồn tại !');
    }
    await this._productRepository.save(
      new ProductEntity(input as unknown as ProductEntity),
    );

    return {
      success: true,
    };
  }
  /**
   * update Product function
   * @param input
   * @returns
   */
  async updateProduct(input: UpdateProductInputDto) {
    const { productId, updateInput } = input;

    const product = await this._productRepository.findById(productId);
    if (!product) throw new Error('Sản phẩm không tồn tại !');

    const { value } = await this._productRepository.findOneAndUpdate(
      { _id: product._id },
      { $set: { ...updateInput } },
    );
    return {
      success: true,
    };
  }
  /**
   * delete Product function
   * @param input
   * @returns
   */
  async deleteProduct(input: ReadProductInputDto) {
    const productExist = await this._productRepository.findById(
      input.productId,
    );
    if (!productExist) {
      throw new Error('Sản phẩm không tồn tại !');
    }
    await this._productRepository.softDeleteById(input.productId);

    return {
      success: true,
    };
  }
  /**
   * create Payment function
   * @param input
   * @returns
   */
  async createPayment(input: CreatePaymentInputDto, userId: string) {
    const {
      code,
      description,
      couponCode,
      items,
      paymentMethod,
      paymentType,
      paymentProvider,
      shippingAddress,
    } = input;
    let amount = 0;
    const newItems = [];
    const discountAmount = 0; // xử lý bởi couponCode

    await Promise.all(
      items.map(async (item: any) => {
        const { id, quantity, name, image, price } = item;
        const product = await this._productRepository.findById(id);

        if (!product) {
          throw new Error('Sản phẩm không tồn tại !');
        }
        item.name = product.name;
        item.price = product.price;
        amount += product.price * quantity;
        newItems.push(item);
      }),
    );
    const amountAfterDiscount = amount - discountAmount;

    const order = {
      amount: amountAfterDiscount,
      description: description || `Mua đồ gia dụng thông minh`,
      code,
      items: newItems,
      userId,
      discountAmount,
      subTotal: amount,
      couponCode,
      paymentMethod,
      shippingStatus: ShippingStatus.NOT_SHIPPED,
      shippingAddress,
    };
    //Thanh toán online
    if (paymentMethod === PaymentMethod.ONLINE) {
      const orderUser = await this._orderRepository.save(
        new OrderEntity({ ...order }),
      );

      if (paymentProvider === PaymentProvider.ZALOPAY) {
        const { returnUrl } = await this._zaloPayService.createPaymentURL(
          orderUser,
          paymentType,
        );
        return {
          redirectUrl: returnUrl,
        };
      }
      if (paymentProvider === PaymentProvider.VNPAY) {
        const { returnUrl } =
          await this._vnPayService.createPaymentURL(orderUser);
        return {
          redirectUrl: returnUrl,
        };
      }
    }
    //Thanh toán offline
    const orderExist = await this._orderRepository.findOne({
      where: {
        code: code,
      },
    });
    // console.log(orderExist);

    if (orderExist) {
      throw new Error('Đơn hàng đã được xử lý trước đó !');
    }

    await this._orderRepository.save(
      new OrderEntity({
        ...order,
      }),
    );
    //update totalSold product
    await Promise.all(
      items.map(async (item: any) => {
        const { id, quantity, name, image, price } = item;
        const product = await this._productRepository.findOneAndUpdate(
          { _id: convertToObjectId(id) },
          { $inc: { totalSold: quantity } },
        );
      }),
    );

    return { success: true };
  }

  async listOrderUser(_id: string): Promise<ListOrderResponse> {
    const orders = await this._orderRepository.find({
      where: {
        userId: _id,
        deletedAt: null,

        $or: [
          {
            paymentMethod: PaymentMethod.OFFLINE,
          },
          {
            paymentMethod: PaymentMethod.ONLINE,
            status: OrderStatus.COMPLETED,
          },
        ],
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return { orders } as any;
  }
  async listOrderAdmin(): Promise<ListOrderResponse> {
    const orders = await this._orderRepository.find({
      where: {
        deletedAt: null,
        $or: [
          {
            paymentMethod: PaymentMethod.OFFLINE,
          },
          {
            paymentMethod: PaymentMethod.ONLINE,
            status: OrderStatus.COMPLETED,
          },
        ],
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return { orders } as unknown as ListOrderResponse;
  }

  async favoriteProduct(input, userId): Promise<BooleanPayload> {
    const { productId } = input;

    const product = await this._productRepository.findById(productId);

    if (!product) throw new Error('Không tìm thấy sự kiện !');

    const existingFavorite = await this._productFavoriteRepository.findOne({
      where: {
        productId,
        userId,
      },
    });

    if (existingFavorite) {
      await this._productFavoriteRepository.findOneAndDelete({
        _id: existingFavorite._id,
      });
      // decrement total favorite
      await this._productRepository.decrementFavorite(product);
    } else {
      await this._productFavoriteRepository.save(
        new ProductFavoriteEntity({
          productId,
          userId,
        }),
      );
      // increment total favorite
      await this._productRepository.incrementFavorite(product);
    }

    return {
      success: true,
    };
  }

  async isFavoriteProduct(input, userId): Promise<BooleanPayload> {
    const { productId } = input;

    const favorite = await this._productFavoriteRepository.findOne({
      where: {
        productId,
        userId,
      },
    });

    return {
      success: !!favorite,
    };
  }

  async confirmOrder(input): Promise<BooleanPayload> {
    const { orderId } = input;
    await this._orderRepository.findOneAndUpdate(
      {
        _id: convertToObjectId(orderId),
      },
      {
        $set: {
          shippingStatus: ShippingStatus.SHIPPING,
        },
      },
    );
    return { success: true };
  }

  async addToCart(input, userId): Promise<BooleanPayload> {
    const { productId, quantity } = input;
    const product = await this._productRepository.findById(productId);

    const cart = await this._cartRepository.findOne({
      where: {
        productId,
        deletedAt: null,
      },
    });
    if (cart) {
      await this._cartRepository.findOneAndUpdate(
        {
          productId,
          userId,
          deletedAt: null,
        },
        {
          $inc: { quantity: quantity },
          $set: { price: product.price },
        },
      );
      return { success: true };
    }

    await this._cartRepository.save(
      new CartEntity({ ...input, userId, price: product.price }),
    );

    return { success: true };
  }
  async removeFromCart(input, userId): Promise<BooleanPayload> {
    const { _id } = input;
    const cart = await this._cartRepository.findById(_id);
    if (!cart) {
      throw new Error('Sản phẩm không tồn tại!');
    }

    await this._cartRepository.softDeleteById(_id);

    return { success: true };
  }
  async listCart(userId) {
    const [data, totalItem] =
      await this._cartRepository.findAllAndCountWithoutDeletedAt({
        where: {
          userId,
        },
      });
    return { cart: data };
  }

  async clearCart(userId): Promise<BooleanPayload> {
    await this._cartRepository.updateMany(
      {
        userId,
        deletedAt: null,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
    );

    return { success: true };
  }
  async detailOrder(input) {
    const { orderId } = input;
    const order = await this._orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại !');
    }

    return order;
  }

  async printOrder(input) {
    const order = await this.detailOrder(input);
    const { _id } = input;
    const user: any = await this.userService.readUser({ _id: order.userId });

    const fonts = {
      Roboto: {
        normal: 'roboto/Roboto-Black.ttf',
        bold: 'roboto/Roboto-Bold.ttf',
        italics: 'roboto/Roboto-Italic.ttf',
        bolditalics: 'roboto/Roboto-BoldItalic.ttf',
      },
    };
    const pdfDefinition = {
      content: [
        {
          text: 'NK-SHOP',
          style: 'header',
        },
        {
          text: 'THÔNG TIN ĐƠN HÀNG',
          style: 'subheader',
        },
        {
          text: `Người Gửi: NK-SHOP`,
          style: 'info',
        },
        {
          text: `Số Điện Thoại: 0389342495`,
          style: 'info',
        },
        {
          text: `Địa chỉ gửi hàng: 175, Tây Sơn, Đống Đa, Hà Nội`,
          style: 'info',
          margin: [0, 0, 0, 20],
        },
        {
          text: `Người nhận: ${user.fullName}`,
          style: 'info',
        },
        {
          text: `Số Điện Thoại: ${user?.phoneNumber || ''}`,
          style: 'info',
        },
        {
          text: `Địa Chỉ Đon Hàng: ${order.shippingAddress}`,
          style: 'info',
          margin: [0, 0, 0, 20],
        },
        {
          text: `Mã Đơn Hàng: ${order.code}`,
          style: 'info',
        },
        {
          text: `Mô Tả: ${order.description}`,
          style: 'info',
          margin: [0, 0, 0, 10],
        },

        {
          text: 'Danh Sách Sản Phẩm:',
          margin: [0, 0, 0, 5],
        },
        {
          table: {
            widths: ['auto', 'auto', 'auto'],
            body: [
              ['Tên Sản Phẩm', 'Số Lượng', 'Giá'],
              ...order.items.map((item: any) => [
                item.name,
                item.quantity,
                currencyFormatter(item.price),
              ]),
            ],
          },
        },
        {
          text: `Số Tiền Thanh Toán: ${
            order.paymentMethod == PaymentMethod.ONLINE
              ? 0
              : currencyFormatter(order.amount)
          }`,
          style: 'info',
          bold: true,
          margin: [100, 10, 10, 10],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [15, 15, 15, 15],
          alignment: 'center',
        },
        info: {
          fontSize: 12,
          margin: [0, 0, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    const file_name = `order.${new Date().getTime()}.pdf`;

    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition, {}, fonts);

    const path = `pdf/${file_name}`;
    const writeStream = fs.createWriteStream(path);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    return { pdfPath: path };
  }

  async createType(input: any) {
    const type = await this._typeRepository.findOne({
      where: {
        name: input.name,
        $or: [
          { deletedAt: null },
          {
            deletedAt: { $gt: new Date() },
          },
        ],
      },
    });
    if (type) {
      throw new Error('Loại sản phẩm đã tồn tại!');
    }
    await this._typeRepository.save(new TypeEntity({ ...input }));
    return { success: true };
  }
  async deleteType(input: any) {
    const TypeExist = await this._typeRepository.findById(input.typeId);
    if (!TypeExist) {
      throw new Error('Loại không tồn tại !');
    }
    await this._typeRepository.softDeleteById(input.typeId);

    return {
      success: true,
    };
  }
  async listType() {
    const data = await this._typeRepository.find({
      where: {
        $or: [
          { deletedAt: null },
          {
            deletedAt: { $gt: new Date() },
          },
        ],
      },
      order: {
        createdAt: -1,
      },
    });
    return { data };
  }

  async createComment(input: any, userId: string) {
    const data = await this._commentRepository.save(
      new CommentEntity({
        ...input,
        userId,
      }),
    );
    if (data) {
      const { value } = await this._productRepository.findOneAndUpdate(
        {
          _id: convertToObjectId(input.productId),
        },
        {
          $inc: { totalComment: 1 },
        },
      );
    }

    return data;
  }
  async listComment(input: any) {
    const data = await this._commentRepository
      .aggregate([
        {
          $match: {
            productId: input.id,
            parentId: null,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $addFields: {
            commentId: { $toString: '$_id' },
          },
        },
        {
          $lookup: {
            from: 'db_comment',
            localField: 'commentId',
            foreignField: 'parentId',
            as: 'feebacks',
          },
        },
        {
          $addFields: {
            countFeedback: { $size: '$feebacks' },
          },
        },
        {
          $project: {
            feebacks: 0,
            commentId: 0,
          },
        },
      ])
      .toArray();
    return {
      data,
    };
  }
  async listFeedback(input: any) {
    const data = await this._commentRepository
      .aggregate([
        {
          $match: {
            parentId: input.parentId,
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ])
      .toArray();

    return { data };
  }

  async listProductByIds(input: any) {
    const { ids } = input;
    const idArr = ids.map((obj) => convertToObjectId(obj));

    const data = await this._productRepository.find({
      where: {
        deletedAt: null,
        _id: { $in: idArr },
      },
    });
    return { data };
  }
}
