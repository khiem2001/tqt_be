import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';
import { MAIL_QUEUE, VERIFY_EMAIL } from 'config';

// @Injectable()
@Processor(MAIL_QUEUE)
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly _mailerService: MailerService) {}

  @OnQueueActive()
  async onActive(job: Job<ISendMailOptions>) {
    console.log(`Sending email to ${job.data.to}...`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<ISendMailOptions>) {
    console.log(`Complete send email ${job.data.to}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, err: any) {
    console.log(`Fail send email ${job.data.to}`);
    console.log(`Error: ${err}`);
  }

  @Process(VERIFY_EMAIL)
  async sendEmail(job: Job<ISendMailOptions>) {
    return this._mailerService.sendMail({
      ...job.data,
    });
  }
}
