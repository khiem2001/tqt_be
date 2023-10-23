import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserDtoType } from '../user/type';
import { UserLoader, UsersLoader } from './loaders/user.loader';
import { ManyMediaLoader, MediaLoader } from './loaders/media.loader';
import { Media, ProductPayload } from '../product/type';
import { ProductLoader, ProductsLoader } from './loaders/product.loader';

export interface IDataloaders {
  userLoader: DataLoader<string, UserDtoType>;
  usersLoader: DataLoader<string, UserDtoType[]>;
  mediaLoader: DataLoader<string, Media>;
  manyMediaLoader: DataLoader<string, Media[]>;
  productLoader: DataLoader<string, ProductPayload>;
  productsLoader: DataLoader<string, ProductPayload[]>;
}

@Injectable()
export class DataloaderService {
  constructor(
    private userLoader: UserLoader,
    private usersLoader: UsersLoader,
    private manyMediaLoader: ManyMediaLoader,
    private mediaLoader: MediaLoader,
    private productLoader: ProductLoader,
    private productsLoader: ProductsLoader,
  ) {}

  createLoaders(): IDataloaders {
    return {
      userLoader: this.userLoader.generateDataLoader(),
      usersLoader: this.usersLoader.generateDataLoader(),
      manyMediaLoader: this.manyMediaLoader.generateDataLoader(),
      mediaLoader: this.mediaLoader.generateDataLoader(),
      productLoader: this.productLoader.generateDataLoader(),
      productsLoader: this.productsLoader.generateDataLoader(),
    };
  }
}
