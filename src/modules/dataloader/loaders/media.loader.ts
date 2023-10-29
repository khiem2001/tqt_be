import { Inject, Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { Media } from '../../product/type';
import { PipeThrowError } from 'util/error';
import { MediaService } from 'modules/media/media.service';
import { sortDataByIds } from 'util/sortDataByIds';

@Injectable()
export class MediaLoader {
  constructor(
    @Inject(MediaService) private readonly mediaService: MediaService,
  ) {}

  generateDataLoader() {
    return new DataLoader<string, Media>(async (keys: string[]) => {
      const { media }: any = this.mediaService.getManyMedia(keys);
      if (!media) {
        return keys.map(() => null);
      }
      return sortDataByIds(media, keys);
    });
  }
}

@Injectable()
export class ManyMediaLoader {
  constructor(
    @Inject(MediaService) private readonly mediaService: MediaService,
  ) {}

  generateDataLoader() {
    return new DataLoader<string, Media[]>(async (keys: string[]) => {
      const { media = [] }: any = await this.mediaService.getManyMedia(keys);

      if (!media) {
        return keys.map(() => null);
      }
      return sortDataByIds(media, keys);
    });
  }
}
