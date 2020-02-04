import { isEmpty, isLength, isEmail, equals } from 'validator';

import { RegisterUserProps } from '../models';
import { isUsername } from './isUsername';

interface RegisterValidationResult {
  errors: Partial<RegisterUserProps>;
  isValid: boolean;
}

/* Complete error messages are replaced in the client. */

export function validateRegisterInput(
  data: RegisterUserProps
): RegisterValidationResult {
  const errors: Partial<RegisterUserProps> = {};
  const { name, email, password, password2 } = data;

  // Check that the `name` field is not empty,
  // has the correct length, and contains only
  // valid characters.
  if (isEmpty(name)) {
    errors.name = 'name.required';
  } else if (!isLength(name, { min: 1, max: 40 })) {
    errors.name = 'name.length';
  } else if (!isUsername(name)) {
    errors.name = 'name.validChars';
  }

  // Checks that `email` is not empty and is
  // a valid email string.
  if (isEmpty(email)) {
    errors.email = 'email.required';
  } else if (!isEmail(email)) {
    errors.email = 'email.isEmail';
  }

  // Checks that password is defined and has correct length.
  if (isEmpty(password)) {
    errors.password = 'password.required';
  } else if (!isLength(password, { min: 6, max: 99 })) {
    errors.password = 'password.length';
  }

  // Checks that `password2` is defined and matches with the other password.
  if (isEmpty(password2)) {
    errors.password2 = 'password2.required';
  } else if (!equals(password, password2)) {
    errors.password2 = 'password2.isMatch';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}
