import {
  CreatePaymentRequest,
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  GetListProductRequest,
  GetListProductResponse,
  GetProductRequest,
  GetProductResponse,
  ListCartResponse,
  ListOrderResponse,
  PRODUCT_SERVICE_NAME,
  ProductServiceClient,
  UpdateProductRequest,
  UpdateProductResponse,
} from '@app/proto-schema/proto/product.pb';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreatePaymentInputDto,
  CreateProductInputDto,
  GetListProductInput,
  ReadProductInputDto,
  UpdateProductInputDto,
} from './input';
import { firstValueFrom } from 'rxjs';
import { AppMetadata, BooleanPayload, PaymentMethod } from '@app/core';
import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import { currencyFormatter } from '@app/utils';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from '@app/proto-schema/proto/user.pb';

@Injectable()
export class ProductService {
  private productService: ProductServiceClient;
  private usersService: UsersServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE_NAME) private readonly productClient: ClientGrpc,
    @Inject(USERS_SERVICE_NAME) private readonly userClient: ClientGrpc,

    private readonly metadata: AppMetadata,
  ) {
    this.productService =
      productClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
    this.usersService =
      userClient.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  /**
   * get Product function
   * @param input
   * @returns
   */
  getProduct(input: ReadProductInputDto): Promise<GetProductResponse> {
    return firstValueFrom(
      this.productService.getProduct(input as GetProductRequest),
    );
  }
  /**
   * get ListProduct function
   * @param input
   * @returns
   */
  getListProduct(input: GetListProductInput): Promise<GetListProductResponse> {
    return firstValueFrom(
      this.productService.getListProduct(
        input as unknown as GetListProductRequest,
      ),
    );
  }
  /**
   * create Product function
   * @param input
   * @returns
   */
  createProduct(input: CreateProductInputDto): Promise<CreateProductResponse> {
    return firstValueFrom(
      this.productService.createProduct(
        input as unknown as CreateProductRequest,
      ),
    );
  }
  /**
   * update Product function
   * @param input
   * @returns
   */
  updateProduct(input: UpdateProductInputDto): Promise<UpdateProductResponse> {
    return firstValueFrom(
      this.productService.updateProduct(
        input as unknown as UpdateProductRequest,
      ),
    );
  }
  /**
   * delete Product function
   * @param input
   * @returns
   */
  deleteProduct(input: ReadProductInputDto): Promise<DeleteProductResponse> {
    return firstValueFrom(
      this.productService.deleteProduct(input as DeleteProductRequest),
    );
  }
  /**
   * create Payment function
   * @param input
   * @returns
   */
  async createPayment(input: CreatePaymentInputDto, userId: string) {
    return await firstValueFrom(
      this.productService.createPayment(
        input as unknown as CreatePaymentRequest,
        this.metadata.setUserId(userId),
      ),
    );
  }

  async listOrderUser(_id: string): Promise<ListOrderResponse> {
    return await firstValueFrom(
      this.productService.listOrderUser({}, this.metadata.setUserId(_id)),
    );
  }
  async listOrderAdmin(): Promise<ListOrderResponse> {
    return await firstValueFrom(this.productService.listOrderAdmin({}));
  }

  async favoriteProduct(input, userId): Promise<BooleanPayload> {
    return await firstValueFrom(
      this.productService.favoriteProduct(
        input,
        this.metadata.setUserId(userId),
      ),
    );
  }

  async isFavoriteEvent(input, userId): Promise<BooleanPayload> {
    return await firstValueFrom(
      this.productService.isFavoriteProduct(
        input,
        this.metadata.setUserId(userId),
      ),
    );
  }

  async confirmOrder(input): Promise<BooleanPayload> {
    return await firstValueFrom(this.productService.confirmOrder(input));
  }

  async addToCart(input, userId): Promise<BooleanPayload> {
    return await firstValueFrom(
      this.productService.addToCart(input, this.metadata.setUserId(userId)),
    );
  }
  async removeFromCart(input, userId): Promise<BooleanPayload> {
    return await firstValueFrom(
      this.productService.removeFromCart(
        input,
        this.metadata.setUserId(userId),
      ),
    );
  }
  async listCart(userId): Promise<ListCartResponse> {
    return await firstValueFrom(
      this.productService.listCart({}, this.metadata.setUserId(userId)),
    );
  }

  async clearCart(userId): Promise<BooleanPayload> {
    return await firstValueFrom(
      this.productService.clearCart({}, this.metadata.setUserId(userId)),
    );
  }
  async detailOrder(input) {
    return await firstValueFrom(this.productService.detailOrder(input));
  }

  async printOrder(input) {
    const order = await firstValueFrom(this.productService.detailOrder(input));
    const { user } = await firstValueFrom(
      this.usersService.readUser({ _id: order.userId }),
    );

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
              ...order.items.map((item) => [
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
}
