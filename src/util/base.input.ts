import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';
import { TransformTrim } from './transform-text';

@InputType()
export class BaseWhereInput {
  @Transform(({ value }) => TransformTrim(value))
  @Expose()
  @Field(() => ID, { nullable: true })
  id_eq?: string;

  @Transform(({ value }) => TransformTrim(value))
  @Expose()
  @Field(() => ID, { nullable: true })
  id_not?: string;

  @Expose()
  @Field(() => [ID], { nullable: true })
  id_notIn?: string[];

  @Expose()
  @Field(() => [ID], { nullable: true })
  id_in?: string[];

  @Expose()
  @Field(() => Int, { nullable: true })
  createdAt_eq?: number;

  @Expose()
  @Field(() => Number, { nullable: true })
  createdAt_lt?: number;

  @Expose()
  @Field(() => Number, { nullable: true })
  createdAt_lte?: number;

  @Expose()
  @Field(() => Number, { nullable: true })
  createdAt_gt?: number;

  @Expose()
  @Field(() => Int, { nullable: true })
  createdAt_gte?: number;

  @Field(() => String, { nullable: true })
  @Expose()
  createdBy_eq?: string;

  @Field(() => [ID], { nullable: true })
  @Expose()
  createdBy_in?: string[];
}

@InputType()
export class PaginationBaseInput {
  @Field(() => Int, { description: 'Page option' })
  limit: number;

  @Field(() => Int, { description: 'Page option' })
  page: number;

  @Field(() => ID, { description: 'Page option: ID', nullable: true })
  after?: string;

  @Field(() => Boolean, {
    description: 'Page option: No pagination',
    nullable: true,
  })
  noPaginate?: boolean;
}
