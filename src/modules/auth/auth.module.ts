import { Module } from '@nestjs/common';
import { AuthResolver } from './resolver';

@Module({
  imports: [],
  providers: [AuthResolver],
})
export class AuthModule {}
