import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthenticationHttpGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw new UnauthorizedException(err);
    }
    if (!user.active) {
      throw new NotFoundException(
        'Tài khoản không hoạt động. Vui lòng liên hệ quản trị viên !',
      );
    }
    if (!user.verifyPhone) {
      throw new NotFoundException('Số điện thoại chưa được xác thực !');
    }
    return user;
  }
}
