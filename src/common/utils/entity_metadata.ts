import { IPagination } from './interfaces/entity_metadata.interface';

export const getPagination = (pagination?: IPagination) => {
  const limit = pagination?.perPage || 10;
  const skip = (pagination?.page && (pagination?.page - 1) * limit) || 0;
  return { limit, skip };
};
