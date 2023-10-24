import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SmsService } from './sms.service';
import { ConfirmOtpResponse, SendOtpResponse } from './type';
import { ConfirmOtpRequestInput, SendOtpRequestInput } from './input';

@Resolver()
export class SmsResolver {
  constructor(@Inject(SmsService) private _smsService: SmsService) {}

  @Mutation(() => SendOtpResponse)
  async sendOtp(@Args('input') input: SendOtpRequestInput) {
    const result = await this._smsService.sendOtp(input);
    return result;
  }

  @Mutation(() => ConfirmOtpResponse)
  async confirmOtp(@Args('input') input: ConfirmOtpRequestInput) {
    return await this._smsService.confirmOtp(input);
  }

  @Mutation(() => ConfirmOtpResponse)
  async inValidOtp(@Args('input') input: ConfirmOtpRequestInput) {
    return await this._smsService.inValidOtp(input);
  }
}
