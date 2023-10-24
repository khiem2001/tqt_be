import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Validate } from 'class-validator';

@InputType()
export class SendOtpRequestInput {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập số điện thoại',
  })
  phoneNumber: string;
}

@InputType()
export class ConfirmOtpRequestInput {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập phiên làm việc',
  })
  sessionId: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập otp',
  })
  otp: string;
}

@InputType()
export class GetPhoneNumberRequestInput {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập phiên làm việc',
  })
  sessionId: string;
}
