import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class AppleService {
  /**
   * Decode apple token
   * @param token
   * @returns
   */
  async getUserInfo(token: string) {
    try {
      const { kid, alg } = jwt.decode(token, { complete: true }).header;
      // generate publickey from apple token [kid]
      const key = await this.getPublicKey(kid);
      // verify key
      const payload: any = jwt.verify(token, key, {
        algorithms: [alg as Algorithm],
      });
      return {
        email: payload.email || `${payload.at_hash}@apple.com`,
        name: 'Chưa cập nhật',
        id: payload.at_hash,
      };
    } catch (error) {
      throw new Error('Invalid token !');
    }
  }

  /**
   * Generate publickey from apple token
   * @param kid
   * @returns
   */
  getPublicKey = async (kid: string) => {
    const client = jwksClient({
      cache: true,
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    return signingKey;
  };
}
