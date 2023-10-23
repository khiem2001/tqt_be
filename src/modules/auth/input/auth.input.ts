import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches, Validate } from 'class-validator';
import { ConfirmPassword } from 'common/decorator';
import { PhoneValidator } from 'common/validator';
import { Provider } from 'enum/user.enum';
import { regexPassword } from 'util/regex-input';

@InputType()
export class AdminInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập tên đăng nhập',
  })
  userName: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mật khẩu',
  })
  // @Matches(regexPassword, {
  //   message:
  //     'Tối thiểu 8 và tối đa 15 ký tự, ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt',
  // })
  password: string;
}

@InputType()
export class RegisterUserInputDto {
  @Field()
  @IsNotEmpty({
    message: 'Vui lòng nhập tên',
  })
  fullName: string;

  @Field()
  @IsNotEmpty({
    message: 'Vui lòng nhập số điện thoại',
  })
  @Validate(PhoneValidator)
  phoneNumber: string;

  @Field()
  @IsNotEmpty({
    message: 'Vui lòng nhập mật khẩu',
  })
  @Matches(regexPassword, {
    message:
      'Tối thiểu 8 và tối đa 15 ký tự, ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt',
  })
  password: string;
}

@InputType()
export class VerifyPhoneInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập phiên làm việc',
  })
  sessionId: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mã xác nhận',
  })
  otp: string;
}
@InputType()
export class GetPhoneInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập phoneNumber',
  })
  phoneNumber: string;
}

@InputType()
export class LoginUserInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập phoneNumber',
  })
  @Validate(PhoneValidator)
  phoneNumber: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mật khẩu',
  })
  @Matches(regexPassword, {
    message:
      'Tối thiểu 8 và tối đa 15 ký tự, ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt',
  })
  password: string;
}

@InputType()
export class LoginSocialInputDto {
  @Field(() => Provider)
  @IsNotEmpty({
    message: 'Vui long nhap provider',
  })
  provider: Provider;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui long nhap token',
  })
  accessToken: string;
}
@InputType()
export class ChangePasswordInputDto {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mật khẩu',
  })
  @Matches(regexPassword, {
    message:
      'Tối thiểu 8 và tối đa 16 ký tự, ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt',
  })
  password: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập phiên làm việc',
  })
  sessionId: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập mã xác nhận',
  })
  otp: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập lại mật khẩu',
  })
  @ConfirmPassword('password')
  confirmPassword: string;
}
