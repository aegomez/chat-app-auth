import { body, ValidationChain } from 'express-validator';

/**
 * Check that `nameOrEmail` is defined, has correct length,
 * and has only valid characters.
 */
const nameOrEmailRules = body('nameOrEmail')
  .exists()
  .withMessage('Name/Email field is required.')
  .isLength({ min: 1, max: 40 })
  .withMessage('Incorrect username or password.');

/**
 * Check that `password` is defined and
 * has correct length.
 */
const passwordRules = body('password')
  .exists()
  .withMessage('Password field is required.')
  .isLength({ min: 6, max: 99 })
  .withMessage('Incorrect username or password.');

/**
 * Middleware, apply validation rules for
 * `express-validator`. Checks for the existence
 * and validity of fields `nameOrEmail` and
 * `password` in the request body.
 * Must be invoked as a function.
 */
export const createLoginValidation = (): ValidationChain[] => [
  nameOrEmailRules,
  passwordRules
];
