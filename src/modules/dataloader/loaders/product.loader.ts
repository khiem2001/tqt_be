import { Inject, Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { catchError, firstValueFrom, timeout } from 'rxjs';

import { ProductPayload } from '../../product/type';
import { ProductService } from 'modules/product/service';
import { PipeThrowError } from 'util/error';
import { sortDataByIds } from 'util/sortDataByIds';

@Injectable()
export class ProductLoader {
  constructor(
    @Inject(ProductService) private readonly productService: ProductService,
  ) {}

  generateDataLoader() {
    return new DataLoader<string, ProductPayload>(async (keys: string[]) => {
      const { data = [] } = await this.productService.listProductByIds({
        ids: keys,
      });
      if (!data) {
        return keys.map(() => null);
      }
      return sortDataByIds(data, keys);
    });
  }
}

@Injectable()
export class ProductsLoader {
  constructor(
    @Inject(ProductService) private readonly productService: ProductService,
  ) {}

  generateDataLoader() {
    return new DataLoader<string, ProductPayload[]>(async (keys: string[]) => {
      const { data = [] } = await this.productService.listProductByIds({
        ids: keys,
      });
      if (!data) {
        return keys.map(() => null);
      }
      return sortDataByIds(data, keys);
    });
  }
}
