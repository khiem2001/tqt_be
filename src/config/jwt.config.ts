import { ConfigService } from '@nestjs/config';

export const config = new ConfigService();
export const JWT_COMMON = {
  accessToken: {
    privateKey: config.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
    },
  },
  refreshToken: {
    privateKey: config.get('NKSHOP-REFRESH'),
    signOptions: {
      expiresIn: config.get('REFRESH_TOKEN_EXPIRES_IN'),
    },
  },
  adminAccessToken: {
    privateKey: config.get('JWT_SECRET_ADMIN'),
    signOptions: {
      expiresIn: config.get('ACCESS_TOKEN_EXPIRES_IN'), // 30d
    },
  },
  adminRefreshToken: {
    privateKey: config.get('REFRESH_TOKEN_SECRET_ADMIN'),
    signOptions: {
      expiresIn: config.get('REFRESH_TOKEN_EXPIRES_IN'), // 365d
    },
  },
};
