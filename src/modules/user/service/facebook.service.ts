import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FacebookService {
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v7.0/me?fields=email,name&access_token=${accessToken}`,
      );
      const { email, id, name } = response.data;
      return {
        email: email || `${id}@facebook.com`,
        id,
        name,
      };
    } catch (error) {
      throw new Error('InvalidToken !');
    }
  }
}
