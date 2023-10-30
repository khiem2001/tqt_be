import { Module } from '@nestjs/common';
import {
  CommentResolver,
  ListProductByIdsResolver,
  ListProductResolver,
  OrderDtoResolver,
  ProductResolver,
  TypeResolver,
} from './resolver';
import {
  CommentService,
  ProductService,
  VNPayService,
  ZaloPayService,
} from './service';
import { FindNoSQL } from 'util/find.operator';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CartEntity,
  CommentEntity,
  OrderEntity,
  ProductEntity,
  ProductFavoriteEntity,
  TypeEntity,
  UserEntity,
} from 'common/entity';
import {
  CartRepository,
  CommentRepository,
  OrderRepository,
  ProductFavoriteRepository,
  ProductRepository,
  TypeRepository,
} from './repository';
import {
  AppleService,
  FacebookService,
  GoogleService,
  UserService,
} from 'modules/user/service';
import { PUB_SUB } from 'config';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { AdminRepository, UserRepository } from 'modules/user/repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartRepository,
      OrderRepository,
      CommentRepository,
      ProductRepository,
      ProductFavoriteRepository,
      TypeRepository,
      UserEntity,
      AdminRepository,
    ]),
  ],
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
    ZaloPayService,
    VNPayService,
    UserService,
    FacebookService,
    GoogleService,
    AppleService,
    {
      provide: PUB_SUB,
      useFactory: (configService: ConfigService) =>
        new RedisPubSub({
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
      inject: [ConfigService],
    },

    // CartTypeResolver,
  ],
})
export class ProductModule {}
