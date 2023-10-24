import { AppMetadata, BooleanPayload, PipeThrowError } from '@app/core';
import {
  ListTypeRequest,
  ListTypeResponse,
  PRODUCT_SERVICE_NAME,
  ProductServiceClient,
  ProductType,
} from '@app/proto-schema/proto/product.pb';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import {
  DeleteTypeInput,
  GetListTypeResponse,
  ListTypeInput,
  ProductTypeInput,
} from './type/product-type.type';

export class TypeResolver {
  private productService: ProductServiceClient;
  constructor(
    @Inject(PRODUCT_SERVICE_NAME) private readonly productClient: ClientGrpc,
    private readonly metadata: AppMetadata,
  ) {
    this.productService =
      productClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  @Mutation(() => BooleanPayload)
  async createType(@Args('input') input: ProductTypeInput) {
    return await this.productService.createType(input as ProductType);
  }
  @Mutation(() => BooleanPayload)
  async deleteType(@Args('input') input: DeleteTypeInput) {
    return await this.productService.deleteType(input);
  }
  @Query(() => GetListTypeResponse)
  async listType() {
    return await this.productService.listType({});
  }
}
