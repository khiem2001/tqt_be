import { AppMetadata } from '@app/core';
import {
  MAILER_SERVICE_NAME,
  MailerServiceClient,
  SendEmailRequest,
  SendEmailResponse,
  VerifyEmailResponse,
} from '@app/proto-schema/proto/mailer.pb';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from '@app/proto-schema/proto/user.pb';

import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MailerService {
  private mailerService: MailerServiceClient;
  private userService: UsersServiceClient;

  constructor(
    @Inject(MAILER_SERVICE_NAME) private readonly mailerClient: ClientGrpc,
    @Inject(USERS_SERVICE_NAME) private readonly userClient: ClientGrpc,
    private readonly metadata: AppMetadata,
  ) {}

  onModuleInit() {
    this.mailerService =
      this.mailerClient.getService<MailerServiceClient>(MAILER_SERVICE_NAME);
    this.userService =
      this.userClient.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async sendEmail({ email }): Promise<SendEmailResponse> {
    const { user } = await firstValueFrom(
      this.userService.getUserByEmail({ email }),
    );
    if (user) {
      throw new RpcException(
        'Email đã được sử dụng. Vui lòng sử dụng email khác.',
      );
    }
    return await firstValueFrom(this.mailerService.sendEmail({ email }));
  }
  async verifyEmail({ otp, sessionId }, _id): Promise<VerifyEmailResponse> {
    return await firstValueFrom(
      this.mailerService.verifyEmail(
        { otp, sessionId },
        this.metadata.setUserId(_id),
      ),
    );
  }
}
