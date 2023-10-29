import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMediaDto, PageOptionsDto } from './dtos';
import { parse } from 'path';
import { AuthenticationHttpGuard } from 'modules/auth/guard';
import { ApiFile, AuthUser } from 'common/decorator';
import { multerOptions } from 'util/storage';
import { ParseFile } from 'util/parse-file.pipe';
import { Multer } from 'multer';
import { MediaStatus } from 'common/entity';

@ApiTags('MEDIA<3')
@Controller('media')
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('/')
  @UseGuards(AuthenticationHttpGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get media list',
  })
  async getMediaList(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: PageOptionsDto,
  ) {
    return this.mediaService.getMediaList(pageOptionsDto);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiFile('file', true, multerOptions)
  async uploadMediaFile(
    @UploadedFile(ParseFile) file: Express.Multer.File,
    @AuthUser() userId: string,
  ) {
    const { filename, mimetype, originalname, path, size } = file;
    const data: CreateMediaDto = {
      userId,
      fileName: filename,
      name: await this.mediaService.createName(parse(originalname).name),
      mimeType: mimetype,
      size,
      duration: 0,
      url: path,
      status: MediaStatus.UPLOADED,
    };
    const media = await this.mediaService.createMedia(data);
    return media;
  }
}
