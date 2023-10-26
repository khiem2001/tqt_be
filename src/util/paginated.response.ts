import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export function Paginated<T>(classRef: Type<T>): any {
  @ObjectType(`${classRef.name}Edge`)
  abstract class PageInfoType {
    @Field(() => Int)
    totalCount: number;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef], { nullable: true })
    items!: T[];

    @Field()
    pageInfo!: PageInfoType;
  }

  return PaginatedType;
}

// Link: https://graphql.org/learn/pagination/#pagination-and-edges

@ObjectType()
export class PaginationResponse {
  @Field(() => Int, { nullable: true })
  currentPage: number;

  @Field(() => Int, { nullable: true })
  totalPage: number;

  @Field(() => Int, { nullable: true })
  pageSize: number;
}
