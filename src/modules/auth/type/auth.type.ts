import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { Gender } from 'enum';

@ObjectType()
export class RegisterUserResponse {
  @Field({ nullable: true })
  phoneNumber: string;

  @Field(() => String)
  sessionId: string;

  @Field(() => Number)
  otpExpiredTime: number;

  @Field(() => String)
  fullName: string;
}

@ObjectType()
export class VerifyPhoneResponse {
  @Field(() => Boolean)
  verified: boolean;
}

@ObjectType()
export class AdminPayload {
  @Field({ nullable: true })
  userName: string;

  @Field({ nullable: true })
  fullName: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  _id: string;
}

@ObjectType()
export class UserPayload {
  @Field({ nullable: false })
  _id: string;

  @Field({ nullable: true })
  fullName: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phoneNumber: string;

  @Field(() => Gender, { nullable: true })
  gender: Gender;

  @Field({ nullable: true })
  verified: boolean;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  twoFactorAuthenticationSecret: boolean;

  @Field({ nullable: true })
  birthday: string;

  @Field({ nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  avatarId: string;

  @Field({ nullable: true })
  createdAt: number;

  @Field({ nullable: true })
  updatedAt: number;

  @Field({ nullable: true })
  verifyPhone: boolean;

  @Field({ nullable: true })
  verifyEmail: boolean;
}

@ObjectType()
export class LoginResponse {
  @Field({ nullable: false })
  token: string;

  @Field({ nullable: false })
  refreshToken: string;

  @Field(() => String)
  expiresAt: Date;

  @Field(() => String)
  refreshTokenExpiresAt: Date;

  @Field(() => UserPayload || AdminPayload, { nullable: true })
  payload: UserPayload | AdminPayload;
}

@ObjectType()
export class ChangePasswordResponse {
  @Field(() => Boolean)
  updated: boolean;
}

@ObjectType()
export class AdminLoginResponse {
  @Field({ nullable: false })
  token: string;

  @Field({ nullable: false })
  refreshToken: string;

  @Field(() => String)
  expiresAt: Date;

  @Field(() => String)
  refreshTokenExpiresAt: Date;

  @Field(() => AdminPayload)
  payload: AdminPayload;
}
