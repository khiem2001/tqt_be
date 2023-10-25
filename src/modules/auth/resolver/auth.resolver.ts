import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import {
  AdminInputDto,
  ChangePasswordInputDto,
  GetPhoneInputDto,
  LoginSocialInputDto,
  LoginUserInputDto,
  RegisterUserInputDto,
  VerifyPhoneInputDto,
} from '../input';
import {
  AdminLoginResponse,
  AdminPayload,
  ChangePasswordResponse,
  LoginResponse,
  RegisterUserResponse,
  UserPayload,
  VerifyPhoneResponse,
} from '../type';
import { AdminGuard, AuthenticationGuard } from '../guard';
import { BooleanPayload } from 'util/reponse';
import { AuthService } from '../service';
import { SmsService } from 'modules/sms/service';
import { UserDtoType } from 'modules/user/type';
import { Media } from 'modules/product/type';
import { IGraphQLContext } from 'util/dataloader.interface';

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AuthService) private readonly _authService: AuthService,
    @Inject(SmsService) private readonly _smsService: SmsService,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Query(() => UserDtoType)
  async getMe(@Context() context: any) {
    return context.req.user;
  }
  @UseGuards(AdminGuard)
  @Query(() => AdminPayload)
  async getAdmin(@Context() context: any) {
    const { fullName, userName, uid } = context.req.user;
    return { fullName, userName, _id: uid };
  }

  @Mutation(() => BooleanPayload)
  async createAdmin(@Args('input') input: AdminInputDto) {
    return this._authService.createAdmin(input);
  }

  @Mutation(() => RegisterUserResponse)
  async registerUser(@Args('input') input: RegisterUserInputDto) {
    const { phoneNumber, fullName } =
      await this._authService.registerUser(input);
    const information = await this._smsService.sendOtp({
      phoneNumber,
    });
    return { fullName: fullName, ...information };
  }

  @Mutation(() => VerifyPhoneResponse)
  async verifyPhone(@Args('input') input: VerifyPhoneInputDto) {
    const { sessionId } = input;
    const { confirmed } = await this._smsService.confirmOtp(input);
    if (confirmed) {
      const { phoneNumber } = await this._smsService.getPhoneNumber({
        sessionId,
      });
      return await this._authService.verifyPhone({ phoneNumber });
    }
  }

  @Mutation(() => LoginResponse)
  async loginUser(@Args('input') input: LoginUserInputDto) {
    return await this._authService.loginUser(input);
  }

  @Mutation(() => LoginResponse)
  async loginSocial(@Args('input') input: LoginSocialInputDto) {
    return await this._authService.loginSocial(input);
  }

  @Mutation(() => ChangePasswordResponse)
  async changePassword(@Args('input') input: ChangePasswordInputDto) {
    const { sessionId, password, otp } = input;
    const { confirmed } = await this._smsService.confirmOtp({
      sessionId,
      otp,
    });
    if (confirmed) {
      const { phoneNumber } = await this._smsService.getPhoneNumber({
        sessionId,
      });
      return await this._authService.changePassword({ phoneNumber, password });
    }
  }
  @Mutation(() => AdminLoginResponse)
  async adminLogin(@Args('input') input: AdminInputDto) {
    return await this._authService.adminLogin(input);
  }
}
@Resolver(() => UserPayload)
export class UserLoaderResolver {
  @ResolveField('avatarId', () => Media, { nullable: true })
  async avatar(
    @Parent() user: UserPayload,
    @Context() { loaders }: IGraphQLContext,
  ) {
    if (user?.avatarId) {
      return loaders.mediaLoader.load(user?.avatarId);
    }
    return null;
  }
}
