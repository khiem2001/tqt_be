import { Inject, Injectable } from '@nestjs/common';
import {
  ConfirmOtpRequestInput,
  GetPhoneNumberRequestInput,
  SendOtpRequestInput,
} from '../input';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'util/base.repository';
import { OtpEntity } from 'common/entity';
import * as moment from 'moment';
import * as ms from 'ms';
import { generateOTP } from 'util/otp';
import mongoose from 'mongoose';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OtpRepository } from '../repository';

export class SmsService {
  constructor(
    private _repository: OtpRepository,
    @InjectQueue('sms') private readonly smsQueue: Queue,
  ) {}

  async sendOtp(input: SendOtpRequestInput) {
    const { phoneNumber: inputPhone } = input;

    const otpGenerate = await generateOTP(6);
    const { otpExpiredTime, otp, phoneNumber, sessionId } =
      await this._repository.save(
        new OtpEntity({
          otp: otpGenerate,
          phoneNumber: inputPhone,
          otpExpiredTime: moment()
            .add(ms('2m') / 1000, 's')
            .toDate(),
          sessionId: new mongoose.Types.ObjectId().toString(),
        }),
      );

    this.smsQueue.add('sendSmsQueue', {
      phoneNumber: inputPhone,
      otp: otpGenerate,
    });
    return {
      otpExpiredTime,
      phoneNumber,
      sessionId,
    };
  }

  async confirmOtp(input: ConfirmOtpRequestInput) {
    const { otp: inputOTP, sessionId } = input;

    const session = await this._repository.findOne({
      where: {
        sessionId: sessionId,
      },
    });
    if (!session) {
      throw new Error('Phiên làm việc đã kết thúc');
    }
    const { otpExpiredTime, otp, isActive } = session;
    if (otp !== inputOTP) {
      throw new Error('Mã xác thực không chính xác !');
    }
    if (new Date() > otpExpiredTime || isActive) {
      throw new Error('Mã xác thực đã hết hạn !');
    }

    const { result }: any = await this._repository.updateOne(
      { sessionId },
      { $set: { isActive: true } },
    );

    return {
      confirmed: !!result.ok,
    };
  }

  async getPhoneNumber({ sessionId }: GetPhoneNumberRequestInput) {
    const data = await this._repository.findOne({
      where: {
        sessionId,
      },
    });

    if (!data || new Date() > data.otpExpiredTime)
      throw new Error('Đã hết thời gian phiên làm việc. Vui lòng thử lại');

    return {
      phoneNumber: data.phoneNumber,
    };
  }

  /**
   *
   * @param param0
   * @returns
   */
  async inValidOtp(input: ConfirmOtpRequestInput) {
    const { otp: inputOTP, sessionId } = input;

    const session = await this._repository.findOne({
      where: {
        sessionId,
      },
    });
    if (!session)
      throw new Error('Đã hết thời gian phiên làm việc. Vui lòng thử lại');

    const { otpExpiredTime, otp, isActive } = session;

    if (otp !== inputOTP) throw new Error('Mã xác thực không chính xác !');

    if (new Date() > otpExpiredTime)
      throw new Error('Mã xác thực đã hết hạn !');

    if (isActive) throw new Error('Mã xác thực đã hết hạn !');

    return {
      confirmed: true,
    };
  }
}
