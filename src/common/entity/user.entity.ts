import { ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { Provider } from '@nestjs/common';
import { Gender } from 'enum/user.enum';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_users')
@ObjectType()
export class UserEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  fullName?: string;

  @Column()
  @Expose()
  email?: string;

  @Column()
  @Expose()
  password?: string;

  @Column()
  @Expose()
  phoneNumber?: string;

  @Column()
  @Expose()
  provider?: Provider;

  @Expose()
  @Column()
  providerId: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  verifyEmail: boolean = false;

  @Expose()
  @Column({ type: 'boolean', default: false })
  verifyPhone: boolean = false;

  @Expose()
  @Column({ type: 'boolean', default: false })
  verified: boolean = false;

  @Expose()
  @Column({ type: 'boolean', default: true })
  active: boolean = true;

  @Expose()
  @Column({ type: 'boolean', default: false })
  twoFactorAuthenticationSecret: boolean = false;

  @Column()
  @Expose()
  gender?: Gender = Gender.Unknown;

  @Column({ default: undefined })
  @Expose()
  birthday: Date;

  @Column({ default: undefined })
  @Expose()
  address: string;

  @Column()
  @Expose()
  avatarId: string;

  constructor(user: Partial<UserEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(UserEntity, user, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
