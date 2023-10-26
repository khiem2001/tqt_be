import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_admin')
@ObjectType()
export class AdminEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  @Field()
  fullName?: string;

  @Column()
  @Expose()
  @Field()
  password?: string;

  @Column()
  @Expose()
  @Field()
  userName?: string;

  constructor(admin: Partial<AdminEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(AdminEntity, admin, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
