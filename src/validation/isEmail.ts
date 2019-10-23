import { body, ValidationChain } from 'express-validator';

/**
 * Returns a small middleware that creates
 * an `express-validator` error if the
 * `nameOrEmail` field in the request body
 * is not an email.
 */
export const checkIfEmail = (): ValidationChain =>
  body('nameOrEmail')
    .isEmail()
    .bail()
    .normalizeEmail();
