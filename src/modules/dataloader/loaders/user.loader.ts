import { Inject, Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { UserDtoType } from '../../user/type';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { sortDataByIds } from 'util/sortDataByIds';
import { UserService } from 'modules/user/service';

@Injectable()
export class UserLoader {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  generateDataLoader() {
    return new DataLoader<string, UserDtoType>(async (keys: string[]) => {
      const { user = [] } = await this.userService.getListUserByIds({
        ids: keys,
      });

      if (!user) {
        return keys.map(() => null);
      }
      return sortDataByIds(user, keys);
    });
  }
}

@Injectable()
export class UsersLoader {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  generateDataLoader() {
    return new DataLoader<string, UserDtoType[]>(async (keys: string[]) => {
      const { user = [] } = await this.userService.getListUserByIds({
        ids: keys,
      });
      if (!user) {
        return keys.map(() => null);
      }
      return sortDataByIds(user, keys);
    });
  }
}
