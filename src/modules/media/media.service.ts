import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import {
  CreateMediaDto,
  MediasPageDto,
  PageMetaDto,
  PageOptionsDto,
} from './dtos';
import { ForbiddenError } from 'apollo-server-express';
import { convertToObjectId } from 'util/convert-to-objectId';

@Injectable()
export class MediaService {
  constructor(private readonly _repository: MediaRepository) {}

  /**
   *
   * @param pageOptionsDto
   * @returns
   */
  public async getMediaList(pageOptionsDto: PageOptionsDto) {
    const [medias, countMedias] = await this._repository.findAndCount({
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.take,
      order: {
        createdAt: pageOptionsDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: countMedias,
    });

    return new MediasPageDto(medias, pageMetaDto);
  }

  /**
   * @param name
   * @returns
   */
  public async createName(name: string) {
    let index = 1;
    const baseName = name;
    while (await this.checkIfExistsName(name)) {
      name = baseName + '-' + index++;
    }
    return name;
  }

  /**
   * @param name
   */
  public async checkIfExistsName(name: string) {
    const count = await this._repository.count({
      name: name,
    });
    return count > 0 ? true : false;
  }

  /**
   *
   * @param createMediaDto
   */
  public async createMedia(input: CreateMediaDto) {
    try {
      const media = this._repository.create(input);
      await this._repository.save(media);
      return media;
    } catch (error) {
      throw new ForbiddenError(error);
    }
  }

  /**
   *
   * @param ids
   * @returns
   */
  public async getManyMedia(ids: string[]) {
    try {
      const objectIds = ids.map((id) => {
        return convertToObjectId(id);
      });

      const media = await this._repository.find({
        where: {
          _id: { $in: objectIds },
        },
      });

      return { media };
    } catch (error) {
      throw new ForbiddenError(error);
    }
  }
}
