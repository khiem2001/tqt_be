import { Field, InputType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Column } from 'typeorm';

@InputType()
export class OrderItem {
  @Column()
  @Expose()
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng chọn sản phẩm',
  })
  id: string;

  @Column()
  @Expose()
  @Field(() => String, { nullable: true })
  name: string;

  @Column()
  @Expose()
  @Field(() => String, { nullable: true })
  image: string;

  @Column()
  @Expose()
  @Field(() => Number)
  @IsNotEmpty({
    message: 'Vui lòng nhập số lượng sản phẩm',
  })
  quantity: number;
}

export class OrderTransaction {
  @Column()
  @Expose()
  gateway: string;

  @Column()
  @Expose()
  id: string;

  @Column(() => Date)
  @Expose()
  time: Date;
}
