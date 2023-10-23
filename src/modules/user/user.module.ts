import { Module } from '@nestjs/common';
import { UserResolver } from './resolver';
import { UserService } from './service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'common/entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserResolver, UserService],
})
export class UserModule {}
