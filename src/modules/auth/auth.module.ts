import { Module } from '@nestjs/common';
import { AuthResolver } from './resolver';
import { AuthService } from './service';
import { PassportModule } from '@nestjs/passport';
import { SmsService } from 'modules/sms/service';
import {
  AppleService,
  FacebookService,
  GoogleService,
  UserService,
} from 'modules/user/service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity, UserEntity } from 'common/entity';
import { OtpRepository } from 'modules/sms/repository';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminRepository } from 'modules/user/repository';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([
      OtpEntity,
      OtpRepository,
      UserEntity,
      AdminRepository,
    ]),
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
  providers: [
    JwtStrategy,
    JwtService,
    AuthResolver,
    AuthService,
    SmsService,
    UserService,
    FacebookService,
    GoogleService,
    AppleService,
  ],
})
export class AuthModule {}
