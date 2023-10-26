import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity, UserEntity } from 'common/entity';
import { Provider } from 'enum/user.enum';
import { BaseRepository } from 'util/base.repository';
import { convertToObjectId } from 'util/convert-to-objectId';
import { comparePassword, hashPassword } from 'util/password';
import { FacebookService } from './facebook.service';
import { GoogleService } from './google.service';
import { AppleService } from './apple.service';
import { AdminRepository } from '../repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private _repository: BaseRepository<UserEntity>,
    private readonly adminRepository: AdminRepository,
    private readonly _facebookService: FacebookService,
    private readonly _googleService: GoogleService,
    private readonly _appleService: AppleService,
  ) {}

  async getIdAdmin() {
    const admin = await this.adminRepository.findOne({});

    if (!admin) {
      throw new Error('Người dùng không tồn tại !');
    }

    return { id: admin._id };
  }

  async listUser() {
    const where: any = {
      $or: [
        { deletedAt: null },
        {
          deletedAt: { $gt: new Date() },
        },
      ],
    };
    const user = await this._repository.find({
      where,
      order: {
        createdAt: -1,
      },
    });

    return { user };
  }
  async updateProfile(input: any) {
    if (input.birthday) {
      const birthday = new Date(input.birthday);
      const { ok } = await this._repository.findOneAndUpdate(
        { _id: convertToObjectId(input.userId) },
        { $set: { ...input, birthday } },
      );
      return {
        updated: !!ok,
      };
    }
    const { ok } = await this._repository.findOneAndUpdate(
      { _id: convertToObjectId(input.userId) },
      { $set: { ...input } },
    );

    return {
      updated: !!ok,
    };
  }

  async updateAvatarUser(input: any, userId: string) {
    const user = await this._repository.findById(userId);
    if (!user) throw new Error('User Not Found !');

    user.avatarId = input.avatarId;
    await this._repository.save(user);

    return {
      success: true,
    };
  }

  async changePasswordWhenLogin(input: any, userId: string) {
    const { currentPassword, newPassword } = input;

    const user = await this._repository.findById(userId);
    if (!user) throw new Error('Tài khoản không tồn tại !');

    //compare currentPassword with user pass
    if (!(await comparePassword(currentPassword, user.password))) {
      throw new Error('Mật khẩu không đúng !');
    }

    await this._repository.update(
      { _id: user._id },
      {
        password: await hashPassword(newPassword),
      },
    );

    return {
      changed: true,
    };
  }
  async lockOrUnLockUser(input: any) {
    const user = await this._repository.findById(input.id);
    if (!user) {
      throw new Error('Ngườii dùng không tồn tại !');
    }
    await this._repository.findOneAndUpdate(
      {
        _id: convertToObjectId(input.id),
      },
      {
        $set: {
          active: !user.active,
        },
      },
    );
    return { success: true };
  }

  async readUser(input: any) {
    const { _id } = input;
    const user = await this._repository.findById(_id);
    if (!user) {
      throw new Error(
        'Không tìm thấy người dùng. Vui lòng liên hệ quản trị viên !',
      );
    }
    return { user };
  }

  async createAdmin(input) {
    const adminExist = await this.adminRepository.findOne({
      where: {
        userName: input.userName,
      },
    });
    if (adminExist) {
      throw new Error('Tên người dùng đã tồn tại');
    }

    await this.adminRepository.save(
      new AdminEntity({
        ...input,
        password: await hashPassword(input.password),
      } as unknown as AdminEntity),
    );

    return {
      success: true,
    };
  }

  async registerUser(input: any) {
    const userExist = await this._repository.findOne({
      where: {
        phoneNumber: input.phoneNumber,
      },
    });

    if (userExist) {
      throw new Error('Số điện thoại đã tồn tại');
    }

    const { _id, fullName, phoneNumber } = await this._repository.save(
      new UserEntity({
        ...input,
        password: await hashPassword(input.password),
      } as unknown as UserEntity),
    );
    return { _id, fullName, phoneNumber };
  }

  async verifyPhone(input) {
    const { phoneNumber } = input;
    const user = await this._repository.findOne({
      where: {
        phoneNumber,
      },
    });
    if (!user) {
      throw new Error('Tài khoản không tồn tại !');
    }
    await this._repository.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          verifyPhone: true,
        },
      },
    );
    return { verified: true };
  }

  async getUserByPhoneNumber(input) {
    const user = await this._repository.findOne({
      where: {
        phoneNumber: input.phoneNumber,
      },
    });
    if (!user.active) {
      throw new Error('Tài khoản của bạn đã bị khoá!');
    }
    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }
    return { user };
  }

  async changePassword(input) {
    const { password, phoneNumber } = input;
    const user = await this._repository.findOne({
      where: {
        phoneNumber,
      },
    });

    if (!user) throw new Error('Tài khoản không tồn tại !');

    await this._repository.update(
      { _id: user._id },
      {
        password: await hashPassword(password),
      },
    );

    return {
      updated: true,
    };
  }

  async loginOrCreateAccount(input: any) {
    const { provider, accessToken } = input;
    const { email, id, name, ...usser } =
      provider === Provider.Facebook
        ? await this._facebookService.getUserInfo(accessToken)
        : provider === Provider.Google
        ? await this._googleService.getUserInfo(accessToken)
        : await this._appleService.getUserInfo(accessToken);
    if (!email) {
      throw new Error(`No email returned from ${provider} provider`);
    }
    let user = await this._repository.findOne({
      where: { email },
    });
    if (user) {
      if (!user.active) throw new Error('Tài khoản của bạn đã bị khoá!');
      await this._repository.update(
        {
          _id: user._id,
        },
        {
          provider,
          providerId: id,
        },
      );
    } else {
      user = await this._repository.save(
        new UserEntity({
          email,
          provider,
          providerId: id,
          fullName: name,
          verified: true,
          verifyEmail: true,
        }),
      );
    }

    return { user };
  }

  async getAdminByUserName(input: any) {
    const { userName } = input;

    const admin = await this.adminRepository.findOne({
      where: {
        userName,
      },
    });

    if (!admin) {
      throw new Error('Người dùng không tồn tại !');
    }

    return { admin };
  }
}
