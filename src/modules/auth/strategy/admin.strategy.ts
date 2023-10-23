import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JWT_COMMON } from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
      },
      secretOrKey: JWT_COMMON['adminAccessToken'].privateKey,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
