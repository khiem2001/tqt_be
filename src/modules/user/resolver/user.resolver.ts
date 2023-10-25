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
import {
  ChangePassWhenLoginType,
  GetIdAdminResponse,
  ListUserResponse,
  UpdateProfileResponse,
  UserDtoType,
} from '../type';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import {
  ChangePassWhenLoginInput,
  LockOrUnLockUserInput,
  UpdateAvatarInput,
  UpdateProfileInputDto,
} from '../input';
import { Media } from 'modules/product/type';
import { IGraphQLContext } from 'util/dataloader.interface';
import { AdminGuard, AuthenticationGuard } from 'modules/auth/guard';
import { UserService } from '../service';
import { BooleanPayload } from 'util/reponse';

@Resolver()
export class UserResolver {
  constructor(
    private userService: UserService;

  ) {}
 

  @Query(() => GetIdAdminResponse)
  async getIdAdmin() {
    return await this.userService.getIdAdmin({});
  }
  @Query(() => ListUserResponse)
  // @UseGuards(AdminGuard)
  async listUser() {
    return await this.userService.listUser({})
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
      })
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
      _id,
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
     _id,
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
