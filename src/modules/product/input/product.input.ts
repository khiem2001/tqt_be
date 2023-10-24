import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { OrderItem } from 'common/entity';
import { PaymentMethod, PaymentProvider, PaymentType } from 'enum/order.enum';
import { PaginationBaseInput } from 'util/base.input';

@InputType()
export class CreateProductInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập tên sản phẩm',
  })
  name: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập tên sản phẩm',
  })
  type: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mô tả sản phẩm',
  })
  description: string;

  @Field(() => Number)
  @IsNumber(
    {},
    {
      message: 'Dữ liệu không hợp lệ',
    },
  )
  @IsNotEmpty({
    message: 'Vui lòng nhập giá sản phẩm',
  })
  price: number;

  @Field(() => Number)
  @IsNumber(
    {},
    {
      message: 'Dữ liệu không hợp lệ',
    },
  )
  @IsNotEmpty({
    message: 'Vui lòng nhập giá sản phẩm',
  })
  countInStock: number;

  @Field(() => String, { nullable: true })
  image: string;

  @Field(() => String, { nullable: true })
  manufacturer: string;

  @Field(() => String, { nullable: true })
  modelNumber: string;

  @Field(() => String, { nullable: true })
  dimensions: string;

  @Field(() => String, { nullable: true })
  weight: string;

  @Field(() => String, { nullable: true })
  connectivity: string;

  @Field(() => String, { nullable: true })
  powerSource: string;

  @Field(() => String, { nullable: true })
  compatibility: string;

  @Field(() => String, { nullable: true })
  warranty: string;
}

@InputType()
export class ReadProductInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập id sản phẩm',
  })
  productId: string;
}

@InputType()
export class ReadManyProductInputDto {
  @Field(() => [String])
  @IsNotEmpty({
    message: 'Vui lòng nhập id sản phẩm',
  })
  ids: string[];
}

@InputType()
export class ProductInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập tên sản phẩm',
  })
  name: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mô tả sản phẩm',
  })
  description: string;

  @Field(() => Number)
  @IsNumber(
    {},
    {
      message: 'Dữ liệu không hợp lệ',
    },
  )
  @IsNotEmpty({
    message: 'Vui lòng nhập giá sản phẩm',
  })
  price: number;

  @Field(() => Number)
  @IsNumber(
    {},
    {
      message: 'Dữ liệu không hợp lệ',
    },
  )
  @IsNotEmpty({
    message: 'Vui lòng nhập giá sản phẩm',
  })
  countInStock: number;

  @Field(() => String, { nullable: true })
  image: string;

  // @Field(() => String)
  // video: string;

  @Field(() => String, { nullable: true })
  manufacturer: string;

  @Field(() => String, { nullable: true })
  modelNumber: string;

  @Field(() => String, { nullable: true })
  dimensions: string;

  @Field(() => String, { nullable: true })
  weight: string;

  @Field(() => String, { nullable: true })
  connectivity: string;

  @Field(() => String, { nullable: true })
  powerSource: string;

  @Field(() => String, { nullable: true })
  compatibility: string;

  @Field(() => String, { nullable: true })
  warranty: string;
  @Field(() => String)
  type: string;
}

@InputType()
export class FilterProductInput {
  @Field(() => Number, { nullable: true })
  price_lte: number;

  @Field(() => Number, { nullable: true })
  price_gte: number;

  @Field(() => String, { nullable: true })
  type_eq: string;
}

@InputType()
export class UpdateProductInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập id sản phẩm',
  })
  productId: string;

  @Field(() => ProductInputDto)
  updateInput: ProductInputDto;
}

@InputType()
export class GetListProductInput {
  @Field(() => PaginationBaseInput)
  pagination: PaginationBaseInput;

  @Field(() => FilterProductInput, { nullable: true })
  filter: FilterProductInput;

  @Field(() => String, { nullable: true })
  query: string;
}

@InputType()
export class CreatePaymentInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mã đơn hàng',
  })
  code: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  couponCode: string;

  @Field(() => [OrderItem])
  @ArrayMinSize(1)
  @ArrayNotEmpty()
  items: OrderItem[];

  @Field(() => PaymentMethod)
  @IsNotEmpty({
    message: 'Vui lòng chọn phương thức thanh toán',
  })
  paymentMethod: PaymentMethod;

  @Field(() => PaymentType, { nullable: true })
  @IsOptional()
  paymentType: PaymentType;

  @Field(() => PaymentProvider, { nullable: true })
  @IsOptional()
  paymentProvider: PaymentProvider;

  @Field(() => String)
  @IsOptional()
  shippingAddress: string;
}

@InputType()
export class FavoriteProductInput {
  @Field(() => String)
  productId: string;
}

@InputType()
export class IsFavoriteProductInput {
  @Field(() => String)
  productId: string;
}

@InputType()
export class ConfirmOrderInput {
  @Field(() => String)
  orderId: string;
}

@InputType()
export class AddToCartInput {
  @Field(() => Number)
  quantity: number;

  @Field(() => String)
  productId: string;
}
@InputType()
export class RemoveFromCartInput {
  @Field(() => String)
  _id: string;
}
