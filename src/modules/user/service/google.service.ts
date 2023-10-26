import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleService {
  async getUserInfo(token: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const { email, id, name } = response.data;
      return { email: email || `${id}@google.com`, id, name };
    } catch (error) {
      throw new Error('Invalid token !');
    }
  }
}
