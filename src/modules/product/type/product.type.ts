import {
  BooleanPayload,
  MediaStatus,
  OrderStatus,
  PaginationResponse,
  PaymentMethod,
  ShippingStatus,
} from '@app/core';
import { OrderTransaction } from '@app/core/entities/cart';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductPayload {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  price: number;

  @Field({ nullable: true })
  countInStock: number;

  @Field(() => Media, { nullable: true })
  image: string;

  @Field({ nullable: true })
  video: string;

  @Field({ nullable: true })
  manufacturer: string;

  @Field({ nullable: true })
  modelNumber: string;

  @Field({ nullable: true })
  dimensions: string;

  @Field({ nullable: true })
  weight: string;

  @Field({ nullable: true })
  connectivity: string;

  @Field({ nullable: true })
  powerSource: string;

  @Field({ nullable: true })
  compatibility: string;

  @Field({ nullable: true })
  warranty: string;

  @Field({ nullable: true })
  totalLike: number;

  @Field({ nullable: true })
  totalComment: number;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  totalSold: number;

  @Field(() => Number, { nullable: true })
  createdAt: number;

  @Field(() => Number, { nullable: true })
  updatedAt: number;
}

@ObjectType()
export class GetProductResponse {
  @Field(() => ProductPayload, { nullable: true })
  product: ProductPayload;
}

@ObjectType()
export class GetListProductResponse {
  @Field(() => [ProductPayload], { nullable: true })
  products: ProductPayload[];

  @Field(() => Number, { nullable: true })
  totalItem: number;

  @Field(() => PaginationResponse, { nullable: true })
  pagination: PaginationResponse;
}

@ObjectType()
export class CreatePaymentResponse {
  @Field({ nullable: true })
  redirectUrl?: string;

  @Field(() => Boolean, { nullable: true })
  success?: boolean;
}
@ObjectType()
export class Media {
  @Field(() => String, { nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  fileName: string;

  @Field(() => String, { nullable: true })
  mimeType: string;

  @Field(() => Number, { nullable: true })
  size: number;

  @Field(() => String, { nullable: true })
  url: string;

  @Field(() => Number, { nullable: true })
  duration: number;

  @Field(() => MediaStatus, { nullable: true })
  status: MediaStatus;

  @Field(() => String, { nullable: true })
  _id: string;
}

@ObjectType()
export class OrderItemResponse {
  @Field(() => ProductPayload)
  id: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => Number)
  quantity: number;

  @Field(() => Number)
  price: number;
}

@ObjectType()
export class OrderTransactionType {
  @Field(() => String, { nullable: true })
  gateway: string;

  @Field(() => String, { nullable: true })
  id: string;

  @Field(() => Number, { nullable: true })
  time: Date;
}

@ObjectType()
export class OrderDto {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  code: string;

  @Field(() => OrderStatus, { nullable: true })
  status: OrderStatus;

  @Field(() => Number, { nullable: true })
  amount: number;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  couponCode: string;

  @Field(() => Number, { nullable: true })
  discountAmount: number;

  @Field(() => Number, { nullable: true })
  subTotal: number;

  @Field(() => String, { nullable: true })
  userId: string;

  @Field(() => PaymentMethod, { nullable: true })
  paymentMethod: PaymentMethod;

  @Field(() => OrderTransactionType, { nullable: true })
  transaction: OrderTransactionType;

  @Field(() => [OrderItemResponse], { nullable: true })
  items: OrderItemResponse[];

  @Field(() => ShippingStatus, { nullable: true })
  shippingStatus: ShippingStatus;

  @Field(() => String, { nullable: true })
  shippingAddress: string;

  @Field(() => Number, { nullable: true })
  createdAt: number;
}

@ObjectType()
export class ListOrderResponse {
  @Field(() => [OrderDto], { nullable: true })
  orders: OrderDto[];
}

@ObjectType()
export class PrintOrderType {
  @Field(() => String, { nullable: true })
  pdfPath: string;
}

@ObjectType()
export class CartType {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => Number, { nullable: true })
  quantity: number;

  @Field(() => Number, { nullable: true })
  price: number;

  @Field(() => String, { nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  productId: string;

  @Field(() => Boolean, { nullable: true })
  status: boolean;
}
@ObjectType()
export class ListCartType {
  @Field(() => [CartType], { nullable: true })
  cart: CartType[];
}
