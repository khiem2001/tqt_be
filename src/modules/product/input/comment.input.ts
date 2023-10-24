import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsMongoId } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng nhập tin nhắn.',
  })
  message: string;

  @Field(() => String)
  @IsNotEmpty({
    message: 'Vui lòng chọn sự kiện.',
  })
  @IsMongoId({
    message: 'ID không đúng định dạng',
  })
  productId: string;

  @Field(() => String, { nullable: true })
  parentId: string;
}

@InputType()
export class ListCommentInput {
  @Field(() => String)
  @IsMongoId({
    message: 'ID không đúng định dạng',
  })
  id: string;
}
@InputType()
export class ListFeedbackInput {
  @Field(() => String)
  parentId: string;
}
