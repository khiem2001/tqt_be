import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { OrderItem, OrderTransaction } from './order.embeded';
import { BaseNoSQLEntity } from 'util/reponse';
import { OrderStatus, PaymentMethod, ShippingStatus } from 'enum/order.enum';

@Entity('db_orders')
export class OrderEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  code: string;

  @Column({ default: OrderStatus.PENDING })
  @Expose()
  status: OrderStatus = OrderStatus.PENDING;

  @Column()
  @Expose()
  amount: number;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  couponCode: string;

  @Column({ default: 0 })
  @Expose()
  discountAmount: number = 0;

  @Column()
  @Expose()
  subTotal: number;

  @Column()
  @Expose()
  userId: string;

  @Column({ default: PaymentMethod.OFFLINE })
  @Expose()
  paymentMethod: PaymentMethod = PaymentMethod.OFFLINE;

  @Column()
  @Expose()
  transaction: OrderTransaction;

  @Column()
  @Expose()
  items: OrderItem[];

  @Column()
  @Expose()
  shippingStatus: ShippingStatus;

  @Column()
  @Expose()
  shippingAddress: string;

  constructor(order: Partial<OrderEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(OrderEntity, order, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
