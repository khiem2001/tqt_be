import { Module } from '@nestjs/common';
import { AuthResolver } from './resolver';
import { AuthService } from './service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
