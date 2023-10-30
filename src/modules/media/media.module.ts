import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaRepository } from './media.repository';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MediaEntity } from 'common/entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaEntity, MediaRepository]),
    ServeStaticModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            __dirname,
            '../../../',
            configService.get<string>('FILE_STORAGE_PATH'),
          ),
          serveRoot: `/${configService.get<string>('FILE_STORAGE_PATH')}`,
          exclude: ['/api*'],
        },
        {
          rootPath: join(
            __dirname,
            '../../../',
            configService.get<string>('FILE_PDF_PATH'),
          ),
          serveRoot: `/${configService.get<string>('FILE_PDF_PATH')}`,
          exclude: ['/api*'],
        },
      ],
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
