import { AppMetadata, PUB_SUB } from '@app/core';
import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { RpcException } from '@nestjs/microservices';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { AdminGuard, AuthenticationGuard } from '../auth/guards';
import { CommentService } from './comment.service';
import {
  CreateCommentInput,
  ListCommentInput,
  ListFeedbackInput,
} from './input';
import { CommentResponse, ListCommentResponse } from './type';
import { ProductService } from './product.service';
import { UserDtoType } from '../user/type';
import { IGraphQLContext } from '@app/core/interfaces';

@Resolver(CommentResponse)
export class CommentResolver {
  constructor(
    @Inject(ProductService) private _productService: ProductService,
    @Inject(CommentService)
    private _commentService: CommentService,
    private readonly metadata: AppMetadata,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

  @Subscription(() => CommentResponse, {
    filter: (payload, variables, ctx) => {
      return payload.onCommentCreated.comment.productId === variables.productId;
    },
    resolve: (payload) => {
      return payload.onCommentCreated.comment;
    },
  })
  onSendMessage(@Args('productId') productId: string) {
    return this.pubSub.asyncIterator('COMMENT_CREATED');
  }

  @Mutation(() => CommentResponse)
  @UseGuards(AuthenticationGuard)
  async createComment(
    @Args('input') { productId, message, parentId }: CreateCommentInput,
    @Context() context: any,
  ) {
    const { _id: userId } = context.req.user;
    const product = await this._productService.getProduct({ productId });
    if (!product) throw new RpcException('Không tìm thấy sự kiện !');

    return await this._commentService.createComment(
      { productId: product.product._id, message, parentId },
      userId,
    );
  }
  @Mutation(() => CommentResponse)
  @UseGuards(AdminGuard)
  async createCommentAdmin(
    @Args('input') { productId, message, parentId }: CreateCommentInput,
    @Context() context: any,
  ) {
    const { uid } = context.req.user;

    const product = await this._productService.getProduct({ productId });
    if (!product) throw new RpcException('Không tìm thấy sự kiện !');

    return await this._commentService.createComment(
      { productId: product.product._id, message, parentId },
      uid,
    );
  }

  @Query(() => ListCommentResponse)
  async listComment(@Args('input') input: ListCommentInput) {
    return await this._commentService.listComment(input);
  }

  @Query(() => ListCommentResponse)
  async listFeedback(@Args('input') input: ListFeedbackInput) {
    return await this._commentService.listFeedback(input);
  }

  @ResolveField('user', () => UserDtoType, { nullable: true })
  async user(
    @Parent() comment: CommentResponse,
    @Context() { loaders }: IGraphQLContext,
  ) {
    if (comment?.userId) {
      return loaders.userLoader.load(comment?.userId);
    }
    return null;
  }
}
