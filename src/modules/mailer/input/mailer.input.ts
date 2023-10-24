import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
@InputType()
export class SendPinCodeInput {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vùng lòng nhập email',
  })
  @IsEmail({
    message: 'Email không đúng định dạng',
  })
  email: string;
}

@InputType()
export class VerifyEmailInput {
  @Field(() => String)
  otp: string;

  @Field(() => String)
  sessionId: string;
}
