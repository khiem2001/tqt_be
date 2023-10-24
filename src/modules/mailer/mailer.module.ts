import { Module } from '@nestjs/common';
import { MailerResolver } from './mailer.resolver';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerResolver, MailerService],
})
export class MailerModule {}
