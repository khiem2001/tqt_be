import { Inject, Injectable } from '@nestjs/common';
import { UserService } from 'modules/user/service';
import { firstValueFrom } from 'rxjs';
import { SendEmailResponse } from '../type';
import { generateOTP } from 'util/otp';
import { OtpEntity } from 'common/entity';
import { MAIL_QUEUE, VERIFY_EMAIL } from 'config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'twilio/lib/twiml/VoiceResponse';
import { ConfigService } from '@nestjs/config';
import { OtpRepository } from '../otp.repository';
import { UserRepository } from 'modules/user/repository';
import * as moment from 'moment';
import * as ms from 'ms';
import { convertToObjectId } from 'util/convert-to-objectId';
import mongoose from 'mongoose';

@Injectable()
export class MailerService {
  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly _mailQueue: Queue,
    private readonly _configService: ConfigService,
    private readonly _otpRepository: OtpRepository,
    private readonly _userRepository: UserRepository,

    @Inject(UserService) private readonly userService: UserService,
  ) {}

  async sendEmail({ email }): Promise<SendEmailResponse> {
    const { user } = await this.userService.getUserByEmail({ email });
    if (user) {
      throw new Error('Email đã được sử dụng. Vui lòng sử dụng email khác.');
    }
    const pinCode = await generateOTP(6);
    const { sessionId } = await this._otpRepository.save(
      new OtpEntity({
        otp: pinCode,
        email: email,
        otpExpiredTime: moment()
          .add(ms('9m') / 1000, 's')
          .toDate(),
        sessionId: new mongoose.Types.ObjectId().toString(),
      }),
    );
    const data = {
      to: email,
      from: this._configService.get('MAILDEV_INCOMING_USER'),
      subject: 'Welcome to NK-SHOP! Verify your Email',
      template: 'verify-email',
      context: { code: pinCode },
    };
    this._mailQueue.add(VERIFY_EMAIL, {
      ...data,
    });
    return {
      sessionId,
    };
  }
  async verifyEmail({ otp: inputOTP, sessionId }, _id) {
    const session = await this._otpRepository.findOne({
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

    const { result }: any = await this._otpRepository.updateOne(
      { sessionId },
      { $set: { isActive: true } },
    );

    await this._userRepository.updateOne(
      { _id: convertToObjectId(_id) },
      {
        $set: {
          email: session.email,
          verifyEmail: true,
        },
      },
    );

    return {
      success: !!result.ok,
    };
  }
}
