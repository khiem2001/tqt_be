import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AdminInputDto,
  GetPhoneInputDto,
  LoginSocialInputDto,
  LoginUserInputDto,
  RegisterUserInputDto,
} from '../input';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import * as ms from 'ms';
import { LoginResponse } from '../type';
import { JWT_COMMON } from 'config';
import { UserService } from 'modules/user/service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * create Admin function
   * @param input
   * @returns
   */
  createAdmin(input: AdminInputDto) {
    return this.userService.createAdmin(input as unknown as CreateAdminRequest);
  }

  /**
   * Regis function
   * @param input
   * @returns
   */
  async registerUser(input: RegisterUserInputDto) {
    const { _id, fullName, phoneNumber } = await firstValueFrom(
      this.userService.registerUser(input),
    );
    return {
      _id,
      fullName,
      phoneNumber,
    };
  }

  /**
   * Verify phone number
   * @param input
   * @returns
   */
  async verifyPhone(input: GetPhoneInputDto) {
    return await firstValueFrom(
      this.userService.verifyPhone(input as VerifyPhoneRequest),
    );
  }

  /**
   * Login function
   * @param input
   * @returns
   */
  async loginUser(input: LoginUserInputDto) {
    const { phoneNumber, password } = input;
    const { user } = await firstValueFrom(
      this.userService.getUserByPhoneNumber({ phoneNumber }),
    );
    if (this._userCanLogin(user)) {
      if (await comparePassword(password, user.password)) {
        const { token, refreshToken, expiresAt, refreshTokenExpiresAt } =
          await this.tradeTokenProcess(user);

        return {
          token,
          refreshToken,
          expiresAt,
          refreshTokenExpiresAt,
          payload: user as any,
        };
      }
      throw new NotFoundException('Mật khẩu không chính xác !');
    }
  }

  /**
   *
   * @param param0
   */
  async changePassword({ phoneNumber, password }) {
    return await firstValueFrom(
      this.userService.changePassword({ phoneNumber, password }),
    );
  }

  /**
   * Check user can login
   * @param user
   * @returns
   */
  _userCanLogin(user: User) {
    if (!user.active) {
      throw new NotFoundException(
        'Tài khoản không hoạt động. Vui lòng liên hệ quản trị viên !',
      );
    }
    return true;
  }
  /**
   * Trade token
   * @param user
   * @returns
   */
  async tradeTokenProcess(user: User) {
    const token = await this.generateToken(user, 'accessToken');
    const refreshToken = await this.generateToken(user, 'refreshToken');
    return {
      token,
      refreshToken,
      expiresAt: moment()
        .add(ms(JWT_COMMON['accessToken'].signOptions.expiresIn) / 1000, 's')
        .toDate(),
      refreshTokenExpiresAt: moment()
        .add(ms(JWT_COMMON['refreshToken'].signOptions.expiresIn) / 1000, 's')
        .toDate(),
    };
  }
  /**
   * This function to generate token
   * @param user
   * @param type
   * @returns
   */
  async generateToken({ email, fullName, _id }: User, type: string) {
    const payload =
      type !== 'refreshToken' ? { email, fullName, uid: _id } : { uid: _id };
    return await this.jwtService.sign(payload, {
      secret: `${JWT_COMMON[type].privateKey}`,
      algorithm: 'HS256',
      expiresIn: `${JWT_COMMON[type].signOptions.expiresIn}`,
    });
  }

  /**
   * This is function to loginSocial
   * @param input
   * @returns
   */
  async loginSocial({
    accessToken,
    provider,
  }: LoginSocialInputDto): Promise<LoginResponse> {
    const { user } = await firstValueFrom(
      this.userService.loginOrCreateAccount({
        accessToken,
        provider,
      } as LoginOrCreateAccountRequest),
    );
    const { token, refreshToken, expiresAt, refreshTokenExpiresAt } =
      await this.tradeTokenProcess(user);

    return {
      token,
      refreshToken,
      expiresAt,
      refreshTokenExpiresAt,
      payload: user as any,
    };
  }

  /**
   * Login function
   * @param input
   * @returns
   */
  async adminLogin({
    password,
    userName,
  }: AdminInputDto): Promise<LoginResponse> {
    const { admin } = await firstValueFrom(
      this.userService.getAdminByUserName({
        userName,
      }),
    );
    // user can login
    if (await comparePassword(password, admin.password)) {
      const { token, refreshToken, expiresAt, refreshTokenExpiresAt } =
        await this.tradeTokenAdminProcess(admin);

      return {
        token,
        refreshToken,
        expiresAt,
        refreshTokenExpiresAt,
        payload: admin,
      };
    }
    throw new RpcException('Mật khẩu không chính xác !');
  }
  /**
   * Trade token
   * @param user
   * @returns
   */
  async tradeTokenAdminProcess(admin: Admin) {
    // generate token
    const token = await this.generateTokenAdmin(admin, 'adminAccessToken');
    // generate refresh token
    const refreshToken = await this.generateTokenAdmin(
      admin,
      'adminRefreshToken',
    );

    return {
      token,
      refreshToken,
      expiresAt: moment()
        .add(
          ms(JWT_COMMON['adminAccessToken'].signOptions.expiresIn) / 1000,
          's',
        )
        .toDate(),
      refreshTokenExpiresAt: moment()
        .add(
          ms(JWT_COMMON['adminRefreshToken'].signOptions.expiresIn) / 1000,
          's',
        )
        .toDate(),
    };
  }

  /**
   * This function to generate token admin
   * @param user
   * @param type
   * @returns
   */
  async generateTokenAdmin({ userName, fullName, _id }: Admin, type: string) {
    const payload =
      type !== 'adminRefreshToken'
        ? { userName, fullName, uid: _id }
        : { uid: _id };

    return await this.jwtService.sign(payload, {
      secret: JWT_COMMON[type].privateKey,
      algorithm: 'HS256',
      expiresIn: JWT_COMMON[type].signOptions.expiresIn,
    });
  }
}
