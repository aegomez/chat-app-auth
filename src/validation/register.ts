import { body, ValidationChain } from 'express-validator';

import { isUsername } from './isUsername';

/* Custom messages, to be replaced with i18n */

const template = (s: string): string => s + ' field is required.';

const m = {
  name: {
    required: template('Username'),
    length: 'Username must be 1 to 40 characters long.',
    validChars:
      'Username may only contain alphanumeric characters, single hyphens or underscores, and cannot begin or end with an hyphen or underscore.'
  },
  email: {
    required: template('Email'),
    isEmail: 'Email is invalid.'
  },
  password: {
    required: template('Password'),
    length: 'Password must be 6 to 99 characters long.'
  },
  password2: {
    required: template('Confirm password'),
    isMatch: 'Passwords must match.'
  }
};

/**
 * Check that `name` is defined, has correct length,
 * and has only valid characters.
 */
const nameRules = body('name')
  .exists()
  .withMessage(m.name.required)
  .isLength({ min: 1, max: 40 })
  .withMessage(m.name.length)
  .custom(isUsername)
  .withMessage(m.name.validChars);

/**
 * Checks that `email` is defined and is
 * a valid email string.
 */
const emailRules = body('email')
  .exists()
  .withMessage(m.email.required)
  .normalizeEmail()
  .isEmail()
  .withMessage(m.email.isEmail);

/**
 * Check that `password` is defined and
 * has correct length.
 */
const passwordRules = body('password')
  .exists()
  .withMessage(m.password.required)
  .isLength({ min: 6, max: 99 })
  .withMessage(m.password.length);
/**
 * Check that `password2` is defined
 * and matches with the other password.
 */
const password2Rules = body('password2')
  .exists()
  .withMessage(m.password2.required)
  .custom((value, { req }) => value !== req.body.password)
  .withMessage(m.password2.isMatch);

/**
 * Middleware, apply validation rules for
 * `express-validator`. Checks for the existence
 * and validity of fields `name`, `email`,
 * `password` and `password2` in the request body.
 * Must be invoked as a function.
 */
export const createRegisterValidation = (): ValidationChain[] => [
  nameRules,
  emailRules,
  passwordRules,
  password2Rules
];
