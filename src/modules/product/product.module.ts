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
    // CartTypeResolver,
  ],
})
export class ProductModule {}
