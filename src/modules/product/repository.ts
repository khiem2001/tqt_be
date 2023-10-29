import {
  CartEntity,
  CommentEntity,
  OrderEntity,
  OrderTransaction,
  ProductEntity,
  ProductFavoriteEntity,
  TypeEntity,
} from 'common/entity';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'util/base.repository';
import { convertToObjectId } from 'util/convert-to-objectId';

@EntityRepository(ProductEntity)
export class ProductRepository extends BaseRepository<ProductEntity> {
  async incrementFavorite(product: ProductEntity) {
    return await this.updateOne(
      { _id: product._id },
      { $set: { totalLike: product.totalLike + 1 } },
    );
  }

  async decrementFavorite(product: ProductEntity) {
    if (product.totalLike <= 0) {
      return;
    }
    return await this.updateOne(
      { _id: product._id },
      { $set: { totalLike: product.totalLike - 1 } },
    );
  }
}

@EntityRepository(CartEntity)
export class CartRepository extends BaseRepository<CartEntity> {}

@EntityRepository(OrderEntity)
export class OrderRepository extends BaseRepository<OrderEntity> {
  async updateOrderTransaction(orderId, data: OrderTransaction) {
    const { result }: any = await this.updateOne(
      { _id: convertToObjectId(orderId) },
      {
        $set: {
          transaction: {
            ...data,
          },
        },
      },
    );
    return result;
  }
}
@EntityRepository(ProductFavoriteEntity)
export class ProductFavoriteRepository extends BaseRepository<ProductFavoriteEntity> {}

@EntityRepository(TypeEntity)
export class TypeRepository extends BaseRepository<TypeEntity> {}

@EntityRepository(CommentEntity)
export class CommentRepository extends BaseRepository<CommentEntity> {}
