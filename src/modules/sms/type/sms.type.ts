import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SendOtpResponse {
  @Field({ nullable: true })
  phoneNumber: string;

  @Field({ nullable: true })
  sessionId: string;

  @Field({ nullable: true })
  otpExpiredTime: number;
}

@ObjectType()
export class ConfirmOtpResponse {
  @Field({ nullable: true })
  confirmed: boolean;
}
