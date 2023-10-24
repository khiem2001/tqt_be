import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductType {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  name: string;
}

@ObjectType()
export class GetListTypeResponse {
  @Field(() => [ProductType], { nullable: true })
  data: ProductType[];
}

@InputType()
export class ListTypeInput {}

@InputType()
export class ProductTypeInput {
  @Field(() => String)
  name: string;
}

@InputType()
export class DeleteTypeInput {
  @Field(() => String)
  typeId: string;
}
