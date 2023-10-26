import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SendPinCodeInput, VerifyEmailInput } from '../input';
import { AuthenticationGuard } from 'modules/auth/guard';
import { MailerService } from '../service';
import { SendEmailResponse } from '../type';
import { BooleanPayload } from 'util/reponse';

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
