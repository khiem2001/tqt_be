import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'common/entity';
import { Repository } from 'typeorm';
import { BaseRepository } from 'util/base.repository';
import { convertToObjectId } from 'util/convert-to-objectId';
import { comparePassword, hashPassword } from 'util/password';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private _repository: BaseRepository<UserEntity>,
  ) {}

  async getIdAdmin() {
    const admin = await this._repository.findOne({});

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
}
