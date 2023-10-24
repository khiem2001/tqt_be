import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SendEmailResponse {
  @Field(() => String, { nullable: true })
  sessionId: string;
}
