import { Module } from '@nestjs/common';
import { UserLoader, UsersLoader } from './loaders/user.loader';
import { DataloaderService } from './dataloader.service';
import { ManyMediaLoader, MediaLoader } from './loaders/media.loader';
import { ProductLoader, ProductsLoader } from './loaders/product.loader';

@Module({
  imports: [],
  providers: [
    UserLoader,
    UsersLoader,
    DataloaderService,
    MediaLoader,
    ManyMediaLoader,
    ProductLoader,
    ProductsLoader,
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
