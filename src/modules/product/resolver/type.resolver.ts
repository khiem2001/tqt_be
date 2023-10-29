import { Inject } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import {
  DeleteTypeInput,
  GetListTypeResponse,
  ListTypeInput,
  ProductType,
  ProductTypeInput,
} from '../type';
import { BooleanPayload } from 'util/reponse';
import { ProductService } from '../service';

export class TypeResolver {
  constructor(
    @Inject(ProductService) private readonly productService: ProductService,
  ) {}

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
    return await this.productService.listType();
  }
}
