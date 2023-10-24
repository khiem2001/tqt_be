import {
  SMS_SERVICE_NAME,
  SmsServiceClient,
} from '@app/proto-schema/proto/sms.pb';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ConfirmOtpRequestInput,
  GetPhoneNumberRequestInput,
  SendOtpRequestInput,
} from './input';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private smsService: SmsServiceClient;

  constructor(
    @Inject(SMS_SERVICE_NAME) private readonly smsClient: ClientGrpc,
  ) {}
  onModuleInit() {
    this.smsService =
      this.smsClient.getService<SmsServiceClient>(SMS_SERVICE_NAME);
  }
  async sendOtp({ phoneNumber }: SendOtpRequestInput) {
    return await firstValueFrom(this.smsService.sendOtp({ phoneNumber }));
  }

  async confirmOtp({ sessionId, otp }: ConfirmOtpRequestInput) {
    return await firstValueFrom(this.smsService.confirmOtp({ sessionId, otp }));
  }

  async getPhoneNumber({ sessionId }: GetPhoneNumberRequestInput) {
    return await firstValueFrom(this.smsService.getPhoneNumber({ sessionId }));
  }

  /**
   *
   * @param param0
   * @returns
   */
  async inValidOtp({ otp, sessionId }: ConfirmOtpRequestInput) {
    return await firstValueFrom(this.smsService.inValidOtp({ otp, sessionId }));
  }
}
