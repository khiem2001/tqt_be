import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from 'common/entity';
import { SmsService } from './service';
import { SmsResolver } from './resolver';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpRepository } from './repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpEntity, OtpRepository]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'sms' }),
  ],
  providers: [SmsService, SmsResolver],
})
export class SmsModule {}
