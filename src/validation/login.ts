import { isEmpty, isEmail, isLength } from 'validator';

import { isUsername } from './isUsername';
import { LoginUserProps } from '../models';

interface LoginValidationResult {
  errors: Partial<LoginUserProps>;
  isName: boolean;
  isValid: boolean;
}

/* Complete error messages are replaced in the client. */

export function validateLoginInput(
  data: LoginUserProps
): LoginValidationResult {
  const errors: Partial<LoginUserProps> = {};
  const { nameOrEmail, password } = data;

  // Saves if the string is recognized as
  // username or as an email.
  let isName = true;

  // Check that name/email field is not empty,
  // whether it is recognized as email or name,
  // and, if name, if it is composed of valid
  // characters only.
  if (isEmpty(nameOrEmail)) {
    errors.nameOrEmail = 'nameOrEmail.required';
  } else if (isEmail(nameOrEmail)) {
    isName = false;
  } else if (!isUsername(nameOrEmail)) {
    errors.nameOrEmail = 'login.incorrect';
    errors.password = 'login.incorrect';
  }

  // Check that the password field is not empty,
  // and has the correct length.
  if (isEmpty(password)) {
    errors.password = 'password.required';
  } else if (!isLength(password, { min: 6, max: 99 })) {
    errors.nameOrEmail = 'nameOrEmail.incorrect';
    errors.password = 'password.incorrect';
  }

  return {
    errors,
    isName,
    isValid: Object.keys(errors).length === 0
  };
}
