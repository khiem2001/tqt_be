import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseNoSQLEntity } from 'util/reponse';

@Entity('db_product')
@ObjectType()
export class ProductEntity extends BaseNoSQLEntity {
  @Column()
  @Expose()
  @Field()
  name: string;

  @Column()
  @Expose()
  @Field()
  description?: string;

  @Column()
  @Expose()
  @Field()
  price: number;

  @Column({ default: 0 })
  @Expose()
  @Field()
  countInStock: number = 0;

  @Column()
  @Expose()
  @Field()
  image?: string;

  @Column()
  @Expose()
  @Field()
  video?: string;

  @Column()
  @Expose()
  @Field()
  manufacturer?: string;

  @Column()
  @Expose()
  @Field()
  modelNumber?: string;

  @Column()
  @Expose()
  @Field()
  dimensions?: string;

  @Column()
  @Expose()
  @Field()
  weight?: string;

  @Column()
  @Expose()
  @Field()
  connectivity?: string;

  @Column()
  @Expose()
  @Field()
  powerSource?: string;

  @Column()
  @Expose()
  @Field()
  compatibility?: string;

  @Column()
  @Expose()
  @Field()
  warranty?: string;

  @Column({ default: 0 })
  @Expose()
  @Field()
  totalLike?: number = 0;

  @Column({ default: 0 })
  @Expose()
  @Field()
  totalComment?: number = 0;

  @Column()
  @Expose()
  @Field()
  type: string;

  @Column({ default: 0 })
  @Expose()
  @Field()
  totalSold?: number = 0;
  constructor(product: Partial<ProductEntity>) {
    super();
    Object.assign(
      this,
      plainToClass(ProductEntity, product, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      }),
    );
  }
}
