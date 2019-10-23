import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware function that evaluates
 * the result of `express-validator`.
 * Returns `next()`, if the validation was
 * successful, or `res.status(400)`, if
 * errors were found.
 */
export const validate: RequestHandler = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (validationErrors.isEmpty()) {
    return next();
  }
  return res.status(400).json({
    errors: validationErrors.mapped()
  });
};
