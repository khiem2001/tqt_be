import { Module } from '@nestjs/common';
import {
  CommentResolver,
  ListProductByIdsResolver,
  ListProductResolver,
  OrderDtoResolver,
  ProductResolver,
  TypeResolver,
} from './resolver';
import { CommentService, ProductService } from './service';
import { FindNoSQL } from 'util/find.operator';

@Module({
  imports: [],
  providers: [
    ProductResolver,
    ProductService,
    CommentResolver,
    CommentService,
    ListProductResolver,
    TypeResolver,
    ListProductByIdsResolver,
    OrderDtoResolver,
    FindNoSQL,

    // CartTypeResolver,
  ],
})
export class ProductModule {}
