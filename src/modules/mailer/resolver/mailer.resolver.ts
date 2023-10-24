import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { MailerService } from './mailer.service';
import { BooleanPayload } from '@app/core';
import { SendPinCodeInput, VerifyEmailInput } from './input';
import { SendEmailResponse } from './type';
import { AuthenticationGuard } from '../auth/guards';

@Resolver()
export class MailerResolver {
  constructor(@Inject(MailerService) private mailerService: MailerService) {}

  @Mutation(() => SendEmailResponse)
  async sendEmail(@Args('input') input: SendPinCodeInput) {
    const result = await this.mailerService.sendEmail(input);
    return result;
  }

  @Mutation(() => BooleanPayload)
  @UseGuards(AuthenticationGuard)
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;

    const result = await this.mailerService.verifyEmail(input, _id);
    return result;
  }
}
