import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as twilio from 'twilio';
import { ConfigService } from '@nestjs/config';

export const config = new ConfigService();

@Processor('sms')
export class SmsProcessor {
  private readonly _logger: Logger = new Logger(SmsProcessor.name);
  private client: twilio.Twilio;

  private readonly TWILIO_ACCOUNT_SID = config.get('TWILIO_ACCOUNT_SID');
  private readonly TWILIO_AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');
  private readonly TWILIO_FROM_PHONE = config.get('TWILIO_FROM_PHONE');
  private readonly TWILIO_TO_PHONE = config.get('TWILIO_TO_PHONE');

  constructor() {
    this.client = twilio(this.TWILIO_ACCOUNT_SID, this.TWILIO_AUTH_TOKEN);
  }
  @OnQueueActive()
  async onActive(job: Job) {
    console.log(`Sending sms to ${job.data.phoneNumber}...`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    console.log(`Complete send sms ${job.data.phoneNumber}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, err: any) {
    console.log(`Fail send sms ${job.data.phoneNumber}`);
    console.log(`Error: ${err}`);
  }

  @Process({
    name: 'sendSmsQueue',
    concurrency: 10,
  })
  async sendSmsProcess(job: Job): Promise<void> {
    const { phoneNumber, otp } = job.data;
    try {
      this._logger.log(`[Starting send sms to ${phoneNumber}]`);

      const messageBody1 = `\nChào quý khách,\nMã OTP của quý khách là: ${otp}.\nVui lòng nhập mã hoàn tất quá trình giao dịch.\nCảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi.\n\n\t\t\tTrân trọng,\n\t\t\tĐội ngũ NK-SHOP`;
      const messageBody2 = `NK-SHOP\nOTP - ${otp}`;
      const messageBody3 = `${otp}`;

      await this.client.messages.create({
        body: messageBody3,
        from: this.TWILIO_FROM_PHONE,
        to: this.TWILIO_TO_PHONE,
      });
    } catch (err) {
      const errMsg = `[ Send SMS error ]: ${err.message}`;
      this._logger.error(errMsg);
    }
  }
}
