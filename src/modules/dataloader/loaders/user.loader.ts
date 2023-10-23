import {
  GetListUserByIdsRequest,
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from '@app/proto-schema/proto/user.pb';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as DataLoader from 'dataloader';
import { UserDtoType } from '../../user/type';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { sortDataByIds } from '@app/utils/loaders/sortDataByIds';
import { PipeThrowError } from '@app/core';

@Injectable()
export class UserLoader {
  private userService: UsersServiceClient;

  constructor(
    @Inject(USERS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  generateDataLoader() {
    return new DataLoader<string, UserDtoType>(async (keys: string[]) => {
      const { user = [] } = await firstValueFrom(
        this.userService
          .getListUserByIds({
            ids: keys,
          } as unknown as GetListUserByIdsRequest)
          .pipe(timeout(5000), catchError(PipeThrowError)),
      );
      if (!user) {
        return keys.map(() => null);
      }
      return sortDataByIds(user, keys);
    });
  }
}

@Injectable()
export class UsersLoader {
  private userService: UsersServiceClient;

  constructor(
    @Inject(USERS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  generateDataLoader() {
    return new DataLoader<string, UserDtoType[]>(async (keys: string[]) => {
      const { user = [] } = await firstValueFrom(
        this.userService
          .getListUserByIds({
            ids: keys,
          } as unknown as GetListUserByIdsRequest)
          .pipe(timeout(5000), catchError(PipeThrowError)),
      );
      if (!user) {
        return keys.map(() => null);
      }
      return sortDataByIds(user, keys);
    });
  }
}
