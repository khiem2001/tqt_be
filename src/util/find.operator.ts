import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOperator } from 'typeorm';

export interface IFindParam {
  where?: any;
  orderBy?: any;
  query?: any;
  limit?: number;
  offset?: number;
  fields?: string[];
  relations?: string[];
}

export interface WhereInput {
  id_eq?: number;
  id_in?: number[];
}

@Injectable()
export class FindNoSQL {
  getOption<W extends WhereInput>({
    where = {},
    limit,
    offset,
    fields,
    orderBy,
    query,
  }: IFindParam = {}): any {
    const findOptions: FindManyOptions = {};

    if (limit) {
      findOptions.take = limit;
    }

    if (offset) {
      findOptions.skip = offset;
    }
    if (fields) {
      if (fields.indexOf('id') === -1) {
        fields.push('id');
      }
      findOptions.select = fields;
    }
    if (Array.isArray(orderBy)) {
      orderBy.forEach((item) => {
        const parts = item.toString().split('_');
        const attr = parts[0];
        const direction: 'ASC' | 'DESC' = parts[1] as 'ASC' | 'DESC';
        findOptions.order = {
          ...findOptions.order,
          [attr]: direction,
        };
      });
    } else if (orderBy) {
      // TODO: allow multiple sorts
      const parts = orderBy.toString().split('_');
      const attr = parts[0];
      const direction: 'ASC' | 'DESC' = parts[1] as 'ASC' | 'DESC';
      // TODO: ensure key is one of the properties on the model
      findOptions.order = {
        [attr]: direction,
      };
    }

    findOptions.where = this.processWhereOptions<W>(where);

    if (query) {
      if (query.text && query.queryBy && Array.isArray(query.queryBy)) {
        findOptions.where = {
          $or: query.queryBy.map((key) => ({
            [key]: { $regex: new RegExp(`.*${query.text}.*`, 'i') },
          })),
          ...findOptions.where,
        };
      }
    }
    return findOptions;
  }

  private processWhereOptions<W extends any>(where: W) {
    if (Array.isArray(where)) {
      const whereOptions: Array<{ [key: string]: FindOperator<any> }> = [];
      Object.keys(where).forEach((k) => {
        const options: any = {};
        for (const index in where[k]) {
          const key = index as keyof W;
          if (where[k][key] === undefined) {
            continue;
          }
          const [attr, operator] = this.getFindOperator(
            String(key),
            where[k][key],
          );
          options[attr] = operator;
        }
        whereOptions.push(options);
      });
      return whereOptions;
    } else {
      const whereOptions: {
        [key: string]: FindOperator<any> | FindOperator<any>[];
      } = {};
      Object.keys(where).forEach((k) => {
        const key = k as keyof W;
        if (where[key] !== undefined && key !== 'or') {
          const [attr, operator] = this.getFindOperator(
            String(key),
            where[key],
          );
          whereOptions[attr] = { ...whereOptions[attr], ...operator };
        }
        // xử lý cho trường hợp or
        if (where[key] !== undefined && key === 'or') {
          const whereOptionsOr: any = this.processWhereOr(where[key]);
          if (whereOptionsOr && Array.isArray(whereOptionsOr))
            whereOptions['$or'] = whereOptionsOr;
        }
      });
      return whereOptions;
    }
  }

  private getFindOperator(key: string, value: any): [string, any] {
    const parts = key.toString().split('_');
    const operator = parts.length > 1 ? parts.pop() : 'eq';
    let attr = parts[0] === 'id' ? 'id' : parts.join('.');

    // With key is _id, keep it. Don't remove _.
    const _parts = key.toString().split('_');
    if (_parts[0] === '' && _parts[1] === 'id') {
      attr = '_id';
    }

    switch (operator) {
      case 'eq':
        if (value === null) {
          return [attr, { $eq: null }];
        }
        if (value === 'true') {
          return [attr, { $eq: true }];
        }
        if (value === 'false') {
          return [attr, { $eq: false }]; // TODO: Catch case false, null
        }
        return [attr, { $eq: value }];
      case 'not':
        return [attr, { $not: { $in: [value] } }];
      case 'notIn':
        return [attr, { $not: { $in: [...value] } }];
      case 'lt':
        return [attr, { $lt: value }];
      case 'lte':
        return [attr, { $lte: value }];
      case 'gt':
        return [attr, { $gt: value }];
      case 'gte':
        return [attr, { $gte: value }];
      case 'in':
        return [attr, { $in: value }];
      case 'contains':
        return [attr, { $regex: new RegExp(`.*${value}.*`, 'i') }];
      case 'startsWith':
        return [attr, { $regex: new RegExp(`^${value}.*`, 'i') }];
      case 'endsWith':
        return [attr, { $regex: new RegExp(`.*${value}$`, 'i') }];
      case 'null':
        return [attr, { $exists: false }];
      default:
        throw new Error(`Can't find operator ${operator}`);
    }
  }

  private processWhereOr(whereOr: any) {
    if (whereOr && Array.isArray(whereOr)) {
      return whereOr.map((where) => {
        return this.processWhereOptions(where);
      });
    }
    return [];
  }
}
