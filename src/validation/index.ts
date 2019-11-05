export * from './isAvailable';
// export * from './isEmail';
// export * from './login';
// export * from './register';
// export * from './validate';

/// TODO
/// - Create new (old) validators
/// - Finish creating and refactor the GraphQL schemas

import { equals, isEmail, isEmpty, isLength, normalizeEmail } from 'validator';
import { isUsername } from './isUsername';
import { toString } from './toString';

/* Custom messages, to be replaced with i18n */
const template = (s: string): string => s + ' field is required.';

const m = {
  nameOrEmail: {
    required: template('Name/Email'),
    incorrect: 'Incorrect username or password.'
  },
  password: {
    required: template('Password')
  }
};

interface LoginUserProps {
  nameOrEmail: string;
  password: string;
}

interface LoginValidationResult {
  errors: Partial<LoginUserProps>;
  isName: boolean;
  isValid: boolean;
}

interface RegisterUserProps {
  name: string;
  email: string;
  password: string;
  password2: string;
}

interface RegisterValidationResult {
  errors: Partial<RegisterUserProps>;
  isValid: boolean;
}

export function validateLoginInput(
  data: LoginUserProps
): LoginValidationResult {
  const errors: Partial<LoginUserProps> = {};
  let { nameOrEmail, password } = data;

  // Normalize fields as string before using validator.
  nameOrEmail = toString(nameOrEmail)
    .trim()
    .toLowerCase();
  password = toString(password);
  console.log('pass:', password);
  console.log('pass is empty:', isEmpty(password));

  // Saves if the string is recognized as
  // username or as an email.
  let isName = true;

  // Check that name/email field is not empty,
  // whether it is recognized as email or name,
  // and, if name, if it is composed of valid
  // characters only.
  if (isEmpty(nameOrEmail)) {
    errors.nameOrEmail = m.nameOrEmail.required;
  } else if (isEmail(nameOrEmail)) {
    isName = false;
  } else if (!isUsername(nameOrEmail)) {
    errors.nameOrEmail = m.nameOrEmail.incorrect;
  }

  // Check that the password field is not empty,
  // and has the correct length.
  if (isEmpty(password)) {
    errors.password = m.password.required;
  } else if (!isLength(nameOrEmail, { min: 6, max: 99 })) {
    errors.nameOrEmail = m.nameOrEmail.incorrect;
  }

  return {
    errors,
    isName,
    isValid: Object.keys(errors).length === 0
  };
}

const mm = {
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
  let { name, email, password, password2 } = data;

  // Normalize fields as string before using validator
  name = toString(name)
    .trim()
    .toLowerCase();
  email = normalizeEmail(toString(email)) || '';
  password = toString(password);
  password2 = toString(password2);

  // Check that the `name` field is not empty,
  // has the correct length, and contains only
  // valid characters.
  if (isEmpty(name)) {
    errors.name = mm.name.required;
  } else if (!isLength(name, { min: 1, max: 40 })) {
    errors.name = mm.name.length;
  } else if (!isUsername(name)) {
    errors.name = mm.name.validChars;
  }

  // Checks that `email` is not empty and is
  // a valid email string.
  if (isEmpty(email)) {
    errors.email = mm.email.required;
  } else if (!isEmail(email)) {
    errors.email = mm.email.isEmail;
  }

  // Checks that password is defined and has correct length.
  if (isEmpty(password)) {
    errors.password = mm.password.required;
  } else if (!isLength(password, { min: 6, max: 99 })) {
    errors.password = mm.password.length;
  }

  // Checks that `password2` is defined and matches with the other password.
  if (isEmpty(password2)) {
    errors.password2 = mm.password2.required;
  } else if (!equals(password, password2)) {
    errors.password2 = mm.password2.isMatch;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}
