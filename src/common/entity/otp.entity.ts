import { Field } from '@nestjs/graphql';
import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('db_otp')
export class OtpEntity {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Column()
  @Expose()
  otp?: string;

  @Column()
  @Expose()
  sessionId?: string;

  @Column()
  @Expose()
  phoneNumber?: string;

  @Column()
  @Expose()
  email?: string;

  @Column({ type: 'timestamp' })
  @Expose()
  otpExpiredTime: Date;

  @Column({ default: false })
  @Expose()
  isActive?: boolean = false;

  constructor(otp: Partial<OtpEntity>) {
    Object.assign(
      this,
      plainToClass(OtpEntity, otp, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
