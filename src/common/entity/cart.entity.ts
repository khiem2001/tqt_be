import { Column, Entity } from 'typeorm';
import { Expose, plainToClass } from 'class-transformer';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_cart')
export class CartEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  quantity: number;

  @Column()
  @Expose()
  price: number;

  @Column()
  @Expose()
  userId: string;

  @Column()
  @Expose()
  productId: string;

  @Column({ default: true })
  @Expose()
  status?: boolean = true;

  constructor(order: Partial<CartEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(CartEntity, order, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
