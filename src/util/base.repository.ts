/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'bson';
import { FindManyOptions, MongoRepository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBaseRepositoryInterface<T> {}

export abstract class BaseRepository<T>
  extends MongoRepository<T>
  implements IBaseRepositoryInterface<T>
{
  /**
   *
   * @param optionsOrConditions
   * @returns
   */
  index(optionsOrConditions?: FindManyOptions<T> | Partial<T>): Promise<T[]> {
    const connection = this.manager.connection;
    const metadata = this.metadata;
    if (
      metadata.deleteDateColumn &&
      optionsOrConditions &&
      'withDeleted' in optionsOrConditions &&
      !optionsOrConditions.withDeleted
    ) {
      if (!optionsOrConditions.where) optionsOrConditions.where = {};
      optionsOrConditions.where[
        connection.driver.escape(metadata.deleteDateColumn.databaseName)
      ] = null;
      return this.find(optionsOrConditions);
    } else {
      return this.find(optionsOrConditions);
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  findById(id: any): Promise<T> {
    return this.findOne({
      where: {
        _id: typeof id === 'string' ? new ObjectId(id) : id,
        $or: [{ deletedAt: null }, { deletedAt: { $gt: new Date() } }],
      },
    });
  }

  /**
   *
   * @param id
   * @returns
   */
  findByIdAndOwner(id: any, userId: any): Promise<T> {
    return this.findOne({
      where: {
        _id: typeof id === 'string' ? new ObjectId(id) : id,
        $or: [{ deletedAt: null }, { deletedAt: { $gt: new Date() } }],
        createdBy: typeof id === 'string' ? new ObjectId(userId) : userId,
      },
    });
  }

  /**
   *
   * @param id
   * @returns
   */
  softDeleteById(id: any, deletedBy?: any): Promise<any> {
    let updatedData: any = {
      deletedAt: new Date(),
    };

    if (deletedBy) {
      updatedData = {
        ...updatedData,
        deletedBy: deletedBy,
      };
    }

    return this.findOneAndUpdate(
      {
        _id: typeof id === 'string' ? new ObjectId(id) : id,
        deletedAt: null,
      },
      {
        $set: updatedData,
      },
    );
  }

  /**
   *
   * @param ids
   * @returns
   */
  getByIds(ids: string[]): Promise<T[]> {
    const _ids = ids.map((id) => new ObjectId(id));

    return this.find({
      where: {
        _id: { $in: _ids },
        $or: [{ deletedAt: null }, { deletedAt: { $gt: new Date() } }],
      },
    });
  }

  /**
   *
   * @param ids
   * @returns
   */
  findAll(conditions: any): Promise<T[]> {
    return this.find({
      where: {
        $or: [{ deletedAt: null }, { deletedAt: { $gt: new Date() } }],
        ...conditions,
      },
    });
  }

  /**
   *
   * @param conditions
   * @returns
   */
  findAllAndCountWithoutDeletedAt(conditions: any): Promise<any> {
    const { where, ...conditionAnother } = conditions;
    return this.findAndCount({
      ...conditionAnother,
      where: {
        ...where,
        $or: [{ deletedAt: null }, { deletedAt: { $gt: new Date() } }],
      },
    });
  }

  /**
   *
   * @param optionsOrConditions
   * @returns
   */
  async allAndCount(optionsOrConditions?: FindManyOptions<T> | Partial<T>) {
    const connection = this.manager.connection;
    const metadata = this.metadata;
    if (
      metadata.deleteDateColumn &&
      optionsOrConditions &&
      'withDeleted' in optionsOrConditions &&
      !optionsOrConditions.withDeleted
    ) {
      if (!optionsOrConditions.where) optionsOrConditions.where = {};
      optionsOrConditions.where[
        connection.driver.escape(metadata.deleteDateColumn.databaseName)
      ] = null;
      return this.findAndCount(optionsOrConditions);
    } else {
      return this.findAndCount(optionsOrConditions);
    }
  }
}
