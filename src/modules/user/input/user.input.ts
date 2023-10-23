import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId, IsOptional, Matches, MaxLength } from 'class-validator';
import { Gender } from 'enum/user.enum';
import { regexPassword } from 'util/regex-input';

@InputType()
export class UpdateProfileInputDto {
  @Field(() => String, { nullable: true })
  @MaxLength(40, {
    message: 'Độ dài tối đa 40 ký tự',
  })
  @IsOptional()
  fullName: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  birthday?: string;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  @IsMongoId({ message: 'Id must be a ObjectId' })
  avatarId: string;
  //   @Field(() => Boolean, { nullable: true })
  //   twoFactorAuthenticationSecret: boolean;
}

@InputType()
export class UpdateAvatarInput {
  @Field(() => String, { nullable: true })
  @IsMongoId({ message: 'Id must be a ObjectId' })
  avatarId: string;
}
@InputType()
export class ChangePassWhenLoginInput {
  @Field(() => String)
  currentPassword: string;

  @Field(() => String)
  @Matches(regexPassword, {
    message:
      'Tối thiểu 8 và tối đa 15 ký tự, ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt',
  })
  @IsOptional()
  newPassword: string;
}
@InputType()
export class LockOrUnLockUserInput {
  @Field(() => String, { nullable: true })
  id: string;
}
