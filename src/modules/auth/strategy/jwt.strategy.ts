import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JWT_COMMON } from 'config';
import { UserService } from 'modules/user/service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
      },
      secretOrKey: JWT_COMMON['accessToken'].privateKey,
    });
  }

  async validate(payload: any) {
    const { uid: _id } = payload;
    const { user } = await firstValueFrom(this.userService.readUser({ _id }));
    return user;
  }
}
