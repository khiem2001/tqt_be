import {
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class AuthenticationGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    return super.canActivate(new ExecutionContextHost([req]));
  }
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (!user.active) {
      throw new NotFoundException(
        'Tài khoản không hoạt động. Vui lòng liên hệ quản trị viên',
      );
    }

    if (!user.verifyPhone) {
      throw new NotFoundException('Số điện thoại chưa được xác thực !');
    }
    return user;
  }
}
