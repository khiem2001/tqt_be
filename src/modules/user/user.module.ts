import { Module } from '@nestjs/common';
import { UserResolver } from './resolver';
import {
  AppleService,
  FacebookService,
  GoogleService,
  UserService,
} from './service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity, UserEntity } from 'common/entity';
import { AdminRepository } from './repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AdminEntity, AdminRepository]),
  ],
  providers: [
    UserResolver,
    UserService,
    AppleService,
    FacebookService,
    AppleService,
    GoogleService,
  ],
})
export class UserModule {}
