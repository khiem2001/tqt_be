import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  CreateCommentInput,
  ListCommentInput,
  ListFeedbackInput,
} from '../input';
import { ProductService } from './product.service';
import { ListCommentResponse } from '../type';

@Injectable()
export class CommentService {
  constructor(
    @Inject(ProductService) private readonly _productService: ProductService,
  ) {}

  async createComment(
    { productId, message, parentId }: CreateCommentInput,
    userId,
  ) {
    return await this._productService.createComment(
      { productId, message, parentId },
      userId,
    );
  }

  async listComment(input: ListCommentInput) {
    return await this._productService.listComment(input);
  }

  async listFeedback(input: ListFeedbackInput) {
    return await this._productService.listFeedback(input);
  }
}
