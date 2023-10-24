import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_product_favorite')
export class ProductFavoriteEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  productId: string;

  @Column()
  @Expose()
  userId: string;

  constructor(revision: Partial<ProductFavoriteEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(ProductFavoriteEntity, revision, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
