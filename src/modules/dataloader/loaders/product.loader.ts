import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as DataLoader from 'dataloader';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { sortDataByIds } from '@app/utils/loaders/sortDataByIds';
import { PipeThrowError } from '@app/core';
import {
  ListProductByIdsRequest,
  PRODUCT_SERVICE_NAME,
  ProductServiceClient,
} from '@app/proto-schema/proto/product.pb';
import { ProductPayload } from '../../product/type';

@Injectable()
export class ProductLoader {
  private productService: ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE_NAME) private readonly productClient: ClientGrpc,
  ) {
    this.productService =
      productClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  generateDataLoader() {
    return new DataLoader<string, ProductPayload>(async (keys: string[]) => {
      const { data = [] } = await firstValueFrom(
        this.productService
          .listProductByIds({
            ids: keys,
          } as unknown as ListProductByIdsRequest)
          .pipe(timeout(5000), catchError(PipeThrowError)),
      );
      if (!data) {
        return keys.map(() => null);
      }
      return sortDataByIds(data, keys);
    });
  }
}

@Injectable()
export class ProductsLoader {
  private productService: ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE_NAME) private readonly productClient: ClientGrpc,
  ) {
    this.productService =
      productClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  generateDataLoader() {
    return new DataLoader<string, ProductPayload[]>(async (keys: string[]) => {
      const { data = [] } = await firstValueFrom(
        this.productService
          .listProductByIds({
            ids: keys,
          } as unknown as ListProductByIdsRequest)
          .pipe(timeout(5000), catchError(PipeThrowError)),
      );
      if (!data) {
        return keys.map(() => null);
      }
      return sortDataByIds(data, keys);
    });
  }
}
