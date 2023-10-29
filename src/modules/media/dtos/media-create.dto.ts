export * from './';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MediaStatus } from 'common/entity';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly mimeType: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly size: number;

  @IsNumber()
  @ApiProperty()
  readonly duration: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly url: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => MediaStatus,
  })
  readonly status: MediaStatus;
}
