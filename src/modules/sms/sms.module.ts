import { Module } from '@nestjs/common';
import { SmsResolver } from './sms.resolver';
import { SmsService } from './sms.service';

@Module({
  providers: [SmsService, SmsResolver],
})
export class SmsModule {}
