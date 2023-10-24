import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_type')
export class TypeEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  name: string;

  constructor(revision: Partial<TypeEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(TypeEntity, revision, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
