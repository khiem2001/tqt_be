import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Multer } from 'multer'; // Import 'Multer' type from 'multer' package

@Injectable()
export class ParseFile implements PipeTransform {
  transform(
    files: Express.Multer.File, // Use 'Multer.File' type
    metadata: ArgumentMetadata,
  ): Express.Multer.File {
    if (files === undefined || files === null) {
      throw new BadRequestException('Validation failed (file expected)');
    }

    if (Array.isArray(files) && files.length === 0) {
      throw new BadRequestException('Validation failed (files expected)');
    }

    return files;
  }
}
