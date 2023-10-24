import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_comment')
export class CommentEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  message: string;

  @Column()
  @Expose()
  productId: string;

  @Column()
  @Expose()
  parentId: string;

  @Column()
  @Expose()
  userId: string;

  @Column({ default: true })
  @Expose()
  isActive: boolean = true;

  constructor(revision: Partial<CommentEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(CommentEntity, revision, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
