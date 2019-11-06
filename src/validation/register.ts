import { isEmpty, isLength, isEmail, equals } from 'validator';

import { RegisterUserProps } from '../models';
import { isUsername } from './isUsername';

interface RegisterValidationResult {
  errors: Partial<RegisterUserProps>;
  isValid: boolean;
}

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

export function validateRegisterInput(
  data: RegisterUserProps
): RegisterValidationResult {
  const errors: Partial<RegisterUserProps> = {};
  const { name, email, password, password2 } = data;

  // Check that the `name` field is not empty,
  // has the correct length, and contains only
  // valid characters.
  if (isEmpty(name)) {
    errors.name = m.name.required;
  } else if (!isLength(name, { min: 1, max: 40 })) {
    errors.name = m.name.length;
  } else if (!isUsername(name)) {
    errors.name = m.name.validChars;
  }

  // Checks that `email` is not empty and is
  // a valid email string.
  if (isEmpty(email)) {
    errors.email = m.email.required;
  } else if (!isEmail(email)) {
    errors.email = m.email.isEmail;
  }

  // Checks that password is defined and has correct length.
  if (isEmpty(password)) {
    errors.password = m.password.required;
  } else if (!isLength(password, { min: 6, max: 99 })) {
    errors.password = m.password.length;
  }

  // Checks that `password2` is defined and matches with the other password.
  if (isEmpty(password2)) {
    errors.password2 = m.password2.required;
  } else if (!equals(password, password2)) {
    errors.password2 = m.password2.isMatch;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}
