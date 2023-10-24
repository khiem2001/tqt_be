import { AppMetadata } from '@app/core';

import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateCommentInput,
  ListCommentInput,
  ListFeedbackInput,
} from './input';
import {
  ListCommentRequest,
  ListCommentResponse,
  ListFeedbackRequest,
  PRODUCT_SERVICE_NAME,
  ProductServiceClient,
} from '@app/proto-schema/proto/product.pb';

@Injectable()
export class CommentService {
  private _productService: ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE_NAME) private readonly _productClient: ClientGrpc,
    private readonly metadata: AppMetadata,
  ) {
    this._productService =
      this._productClient.getService<ProductServiceClient>(
        PRODUCT_SERVICE_NAME,
      );
  }

  async createComment(
    { productId, message, parentId }: CreateCommentInput,
    userId,
  ) {
    return await firstValueFrom(
      this._productService.createComment(
        { productId, message, parentId },
        this.metadata.setUserId(userId),
      ),
    );
  }

  async listComment(input: ListCommentInput): Promise<ListCommentResponse> {
    return await firstValueFrom(
      this._productService.listComment(input as ListCommentRequest),
    );
  }

  async listFeedback(input: ListFeedbackInput): Promise<ListCommentResponse> {
    return await firstValueFrom(
      this._productService.listFeedback(input as ListFeedbackRequest),
    );
  }
}
