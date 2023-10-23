import { ObjectId } from 'bson';

export const convertToObjectId = (id: any) => {
  return typeof id === 'string' ? new ObjectId(id) : id;
};
