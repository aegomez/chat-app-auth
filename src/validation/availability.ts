import { body, ValidationChain } from 'express-validator';
import { findOne } from '../db';

const messages = {
  name: 'Username is not available.',
  email: 'Email is already registered.'
};

const checkIfAvailable = async (
  key: 'name' | 'email',
  value: string
): Promise<void> => {
  const result = await findOne(key, value + '');
  if (result !== null) {
    Promise.reject(messages[key]);
  }
};

/**
 * Middleware, apply validation rules for
 * `express-validator`. Checks if the values
 * provided for fields `name` and `email`
 * are already registered in the database.
 * Must be invoked as a function.
 */
export const createAvailabilityValidation = (): ValidationChain[] => [
  body('name').custom(value => checkIfAvailable('name', value)),
  body('email').custom(value => checkIfAvailable('email', value))
];
