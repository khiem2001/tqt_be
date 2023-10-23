import { AppMetadata, BooleanPayload, PipeThrowError } from '@app/core';
import {
  USERS_SERVICE_NAME,
  UpdateProfileRequest,
  UsersServiceClient,
} from '@app/proto-schema/proto/user.pb';
import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import {
  ChangePassWhenLoginType,
  GetIdAdminResponse,
  ListUserResponse,
  UpdateProfileResponse,
  UserDtoType,
} from '../type';
import { Media } from '../product/type';
import { IGraphQLContext } from '@app/core/interfaces';
import { AdminGuard, AuthenticationGuard } from '../auth/guards';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import {
  ChangePassWhenLoginInput,
  LockOrUnLockUserInput,
  UpdateAvatarInput,
  UpdateProfileInputDto,
} from '../input';

@Resolver()
export class UserResolver {
  private userService: UsersServiceClient;
  constructor(
    @Inject(USERS_SERVICE_NAME) private readonly userClient: ClientGrpc,
    private readonly metadata: AppMetadata,
  ) {}
  onModuleInit() {
    this.userService =
      this.userClient.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }
  k;

  @Query(() => GetIdAdminResponse)
  async getIdAdmin() {
    return await this.userService.getIdAdmin({});
  }
  @Query(() => ListUserResponse)
  // @UseGuards(AdminGuard)
  async listUser() {
    return await firstValueFrom(this.userService.listUser({}));
  }

  @UseGuards(AuthenticationGuard)
  @Mutation(() => UpdateProfileResponse)
  async updateProfile(
    @Args('input') input: UpdateProfileInputDto,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;

    return this.userService
      .updateProfile({
        userId: _id,
        ...input,
      } as unknown as UpdateProfileRequest)
      .pipe(timeout(5000), catchError(PipeThrowError));
  }

  @UseGuards(AuthenticationGuard)
  @Mutation(() => BooleanPayload)
  async updateAvatarUser(
    @Args('input') input: UpdateAvatarInput,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;

    return this.userService.updateAvatarUser(
      input,
      this.metadata.setUserId(_id),
    );
  }

  @UseGuards(AuthenticationGuard)
  @Mutation(() => ChangePassWhenLoginType)
  async changePasswordWhenLogin(
    @Args('input') input: ChangePassWhenLoginInput,
    @Context() context: any,
  ) {
    const { _id } = context.req.user;

    return this.userService.changePasswordWhenLogin(
      input,
      this.metadata.setUserId(_id),
    );
  }
  @UseGuards(AdminGuard)
  @Mutation(() => BooleanPayload)
  async lockOrUnLockUser(
    @Args('input') input: LockOrUnLockUserInput,
    @Context() context: any,
  ) {
    return this.userService.lockOrUnLockUser(input);
  }
}

@Resolver(() => UserDtoType)
export class UsersLoaderResolver {
  @ResolveField('avatarId', () => Media, { nullable: true })
  async avatar(
    @Parent() user: UserDtoType,
    @Context() { loaders }: IGraphQLContext,
  ) {
    if (user?.avatarId) {
      return loaders.mediaLoader.load(user?.avatarId);
    }
    return null;
  }
}
