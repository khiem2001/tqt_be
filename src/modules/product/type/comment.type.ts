import { Field, ObjectType } from '@nestjs/graphql';
import { UserDtoType } from '../../user/type';

@ObjectType()
export class CommentResponse {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  message: string;

  @Field(() => UserDtoType, { nullable: true, name: 'user' })
  userId: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => Number, { nullable: true })
  createdAt: number;

  @Field(() => Number, { nullable: true })
  updatedAt: number;

  @Field(() => Number, { nullable: true })
  countFeedback: number;
}

@ObjectType()
export class ListCommentResponse {
  @Field(() => [CommentResponse], { nullable: true })
  data: CommentResponse[];
}
