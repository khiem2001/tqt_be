import { Inject, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  Args,
  Mutation,
  Resolver,
  Query,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import {
  CartType,
  CreatePaymentResponse,
  GetListProductResponse,
  GetProductResponse,
  ListCartType,
  ListOrderResponse,
  Media,
  OrderDto,
  OrderItemResponse,
  PrintOrderType,
  ProductPayload,
} from './type';
import {
  AddToCartInput,
  ConfirmOrderInput,
  CreatePaymentInputDto,
  CreateProductInputDto,
  FavoriteProductInput,
  GetListProductInput,
  IsFavoriteProductInput,
  ReadProductInputDto,
  RemoveFromCartInput,
  UpdateProductInputDto,
} from './input';
import { BooleanPayload } from '@app/core';
import { AdminGuard, AuthenticationGuard } from '../auth/guards';
import { IGraphQLContext } from '@app/core/interfaces';
import { UserDtoType } from '../user/type';

export class ProductResolver {
  constructor(
    @Inject(ProductService) private readonly _productService: ProductService,
  ) {}

  @Query(() => GetProductResponse)
  async getProduct(@Args('input') input: ReadProductInputDto) {
    return await this._productService.getProduct(input);
  }

  @Query(() => GetListProductResponse)
  async getListProduct(@Args('input') input: GetListProductInput) {
    return await this._productService.getListProduct(input);
  }

  @Mutation(() => BooleanPayload)
  async createProduct(@Args('input') input: CreateProductInputDto) {
    return await this._productService.createProduct(input);
  }

  @Mutation(() => BooleanPayload)
  async updateProduct(@Args('input') input: UpdateProductInputDto) {
    return await this._productService.updateProduct(input);
  }

  @Mutation(() => BooleanPayload)
  async deleteProduct(@Args('input') input: ReadProductInputDto) {
    return await this._productService.deleteProduct(input);
  }

  @Mutation(() => BooleanPayload)
  @UseGuards(AuthenticationGuard)
  async addToCart(
    @Args('input') input: AddToCartInput,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;
    return await this._productService.addToCart(input, _id);
  }

  @Mutation(() => BooleanPayload)
  @UseGuards(AuthenticationGuard)
  async removeFromCart(
    @Args('input') input: RemoveFromCartInput,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;
    return await this._productService.removeFromCart(input, _id);
  }

  @Mutation(() => BooleanPayload)
  @UseGuards(AuthenticationGuard)
  async clearCart(@Context() context: any) {
    const { _id } = context.req.user;
    return await this._productService.clearCart(_id);
  }

  @Query(() => ListCartType)
  @UseGuards(AuthenticationGuard)
  async listCart(@Context() context: any) {
    const { _id } = context.req.user;
    return await this._productService.listCart(_id);
  }

  @Mutation(() => CreatePaymentResponse)
  @UseGuards(AuthenticationGuard)
  async createPayment(
    @Args('input') input: CreatePaymentInputDto,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;

    return await this._productService.createPayment(input, _id);
  }

  @Query(() => ListOrderResponse)
  @UseGuards(AuthenticationGuard)
  async listOrderUser(@Context() context: any) {
    const { _id } = context.req.user;
    return await this._productService.listOrderUser(_id);
  }

  @Query(() => ListOrderResponse)
  // @UseGuards(AdminGuard)
  async listOrderAdmin() {
    return await this._productService.listOrderAdmin();
  }

  @Query(() => OrderDto)
  async detailOrder(@Args('input') input: ConfirmOrderInput) {
    return await this._productService.detailOrder(input);
  }

  @Mutation(() => BooleanPayload)
  @UseGuards(AdminGuard)
  async confirmOrder(@Args('input') input: ConfirmOrderInput) {
    return await this._productService.confirmOrder(input);
  }

  @Mutation(() => BooleanPayload)
  @UseGuards(AuthenticationGuard)
  favoriteProduct(
    @Args('input') input: FavoriteProductInput,
    @Context() context: any,
  ) {
    const { _id: userId } = context.req.user;
    return this._productService.favoriteProduct(input, userId);
  }

  @Query(() => BooleanPayload)
  @UseGuards(AuthenticationGuard)
  async isFavoriteProduct(
    @Args('input') input: IsFavoriteProductInput,
    @Context() context: any,
  ) {
    const { _id: userId } = context.req.user;
    return await this._productService.isFavoriteEvent(input, userId);
  }

  @Mutation(() => PrintOrderType)
  async printOrder(@Args('input') input: ConfirmOrderInput) {
    return await this._productService.printOrder(input);
  }
}

@Resolver(() => ProductPayload)
export class ListProductResolver {
  @ResolveField('image', () => Media, { nullable: true })
  async media(
    @Parent() product: ProductPayload,
    @Context() { loaders }: IGraphQLContext,
  ) {
    if (product?.image) {
      return loaders.mediaLoader.load(product.image);
    }
    return null;
  }
}
@Resolver(() => OrderItemResponse)
export class ListProductByIdsResolver {
  @ResolveField('id', () => ProductPayload, { nullable: true })
  async product(
    @Parent() product: OrderItemResponse,
    @Context() { loaders }: IGraphQLContext,
  ) {
    if (product?.id) {
      return loaders.productLoader.load(product.id);
    }
    return null;
  }
}
@Resolver(() => OrderDto)
export class OrderDtoResolver {
  @ResolveField('userId', () => UserDtoType, { nullable: true })
  async product(
    @Parent() order: OrderDto,
    @Context() { loaders }: IGraphQLContext,
  ) {
    if (order?.userId) {
      return loaders.userLoader.load(order.userId);
    }
    return null;
  }
}

// @Resolver(() => CartType)
// export class CartTypeResolver {
//   @ResolveField('productId', () => ProductPayload, { nullable: true })
//   async product(
//     @Parent() cart: CartType,
//     @Context() { loaders }: IGraphQLContext,
//   ) {
//     if (cart?.productId) {
//       return loaders.productLoader.load(cart.productId);
//     }
//     return null;
//   }
// }
