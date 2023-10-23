import { PipeThrowError } from '@app/core';
import {
  GetManyMediaRequest,
  MediaServiceClient,
  MEDIA_SERVICE_NAME,
} from '@app/proto-schema/proto/media.pb';
import { sortDataByIds } from '@app/utils/loaders/sortDataByIds';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as DataLoader from 'dataloader';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { Media } from '../../product/type';

@Injectable()
export class MediaLoader {
  private mediaService: MediaServiceClient;

  constructor(@Inject(MEDIA_SERVICE_NAME) private readonly client: ClientGrpc) {
    this.mediaService =
      this.client.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
  }

  generateDataLoader() {
    return new DataLoader<string, Media>(async (keys: string[]) => {
      const { media } = await firstValueFrom(
        this.mediaService.getManyMedia({ ids: keys }),
      );
      if (!media) {
        return keys.map(() => null);
      }
      return sortDataByIds(media, keys);
    });
  }
}

@Injectable()
export class ManyMediaLoader {
  private mediaService: MediaServiceClient;

  constructor(@Inject(MEDIA_SERVICE_NAME) private readonly client: ClientGrpc) {
    this.mediaService =
      this.client.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
  }

  generateDataLoader() {
    return new DataLoader<string, Media[]>(async (keys: string[]) => {
      const { media = [] } = await firstValueFrom(
        this.mediaService
          .getManyMedia({
            ids: keys,
          } as unknown as GetManyMediaRequest)
          .pipe(timeout(5000), catchError(PipeThrowError)),
      );

      if (!media) {
        return keys.map(() => null);
      }
      return sortDataByIds(media, keys);
    });
  }
}
