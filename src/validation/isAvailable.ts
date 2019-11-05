import { findOne } from '../db';

export const checkIfAvailable = async (
  key: 'name' | 'email',
  value: string
): Promise<boolean> => {
  const result = await findOne(key, value + '');
  return Promise.resolve(result === null);
};
