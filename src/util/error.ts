import { ForbiddenError } from 'apollo-server-errors';

export const PipeThrowError = (e: any) => {
  console.log('PipeThrowError', e);
  throw new ForbiddenError(e.details || 'Server error!');
};
