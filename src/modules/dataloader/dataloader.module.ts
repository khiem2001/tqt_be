import { Module } from '@nestjs/common';
import { UserLoader, UsersLoader } from './loaders/user.loader';
import { DataloaderService } from './dataloader.service';
import { ManyMediaLoader, MediaLoader } from './loaders/media.loader';
import { ProductLoader, ProductsLoader } from './loaders/product.loader';
import { AppleService, FacebookService, GoogleService, UserService } from 'modules/user/service';
import { MediaService } from 'modules/media/media.service';
import { ProductService, VNPayService, ZaloPayService } from 'modules/product/service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity, CommentEntity, MediaEntity, ProductEntity, UserEntity } from 'common/entity';
import { AdminRepository } from 'modules/user/repository';
import { MediaRepository } from 'modules/media/media.repository';
import { CartRepository, CommentRepository, OrderRepository, ProductFavoriteRepository, ProductRepository, TypeRepository } from 'modules/product/repository';
import { FindNoSQL } from 'util/find.operator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ProductEntity,
      MediaEntity,
      AdminEntity,
      AdminRepository,
      MediaRepository,
      ProductRepository,
      CartRepository,
      OrderRepository,
      CommentRepository,
      ProductFavoriteRepository,
      TypeRepository,
    ])
  ],
  providers: [
    UserLoader,
    UsersLoader,
    DataloaderService,
    MediaLoader,
    ManyMediaLoader,
    ProductLoader,
    ProductsLoader,
    UserService,
    MediaService,
    ProductService,
    FacebookService,
    GoogleService,
    AppleService,
    FindNoSQL,
    ZaloPayService,
    VNPayService
  ],
  exports: [
    UserLoader,
    UsersLoader,
    DataloaderService,
    MediaLoader,
    ManyMediaLoader,
    ProductLoader,
    ProductsLoader,
  ],
})
export class DataloaderModule {}
