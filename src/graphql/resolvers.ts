import { GraphQLFieldResolver } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { normalizeEmail } from 'validator';
import { Response } from 'express';

import {
  validateLoginInput,
  validateRegisterInput,
  checkIfAvailable
} from '../validation';
import { User, LoginUserProps, RegisterUserProps } from '../models';
import { findOne } from '../db';

/* Custom messages, to be replaced with i18n */
const m = {
  login: {
    incorrect: 'Incorrect user or password.',
    service: 'Login service is unavailable.'
  },
  register: {
    usedName: 'Username is not available.',
    usedEmail: 'Email is already registered.',
    service: 'Registration service is unavailable.'
  }
};

const secretOrKey = process.env.JWT_SECRET;

/**
 * Map properties from a dictionary `D` to the
 * `args` parameter of the resolver function and
 * replace its return type for a custom object.
 */
type CustomResolver<D> = (
  ...args: Parameters<GraphQLFieldResolver<{}, { response: Response }, D>>
) => Promise<{
  success: boolean;
  errors: Partial<D>;
  id?: string;
}>;

export const loginResolver: CustomResolver<LoginUserProps> = async (
  _source,
  input,
  context
) => {
  const { isValid, isName, errors } = validateLoginInput(input);

  // Return if the fields are not valid
  if (!isValid) {
    return { success: false, errors };
  }

  try {
    const key = isName ? 'name' : 'email';
    let nameOrEmail = input.nameOrEmail;

    if (!isName) {
      nameOrEmail = normalizeEmail(nameOrEmail) || '';
    }

    // Find user by email or name
    const user = await findOne(key, nameOrEmail);
    if (!user) {
      return {
        success: false,
        errors: { nameOrEmail: m.login.incorrect }
      };
    }

    // If user exists, check the password
    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      return {
        success: false,
        errors: { nameOrEmail: m.login.incorrect }
      };
    }

    // Create JWT payload
    const payload = {
      id: user.id
    };
    // Sign token
    const token = jwt.sign(payload, secretOrKey as string, {
      expiresIn: '1d',
      issuer: 'accounts.chat.app'
    });

    // Tell the client to set a cookie
    context.response.cookie('token', 'Bearer ' + token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    // Return token to client
    return {
      success: true,
      id: user.id,
      errors: {}
    };
  } catch (error) {
    return {
      success: false,
      errors: { nameOrEmail: m.login.service }
    };
  }
};

export const registerResolver: CustomResolver<RegisterUserProps> = async (
  _source,
  input
) => {
  const { isValid, errors } = validateRegisterInput(input);

  // Return if the fields are not valid
  if (!isValid) {
    return { success: false, errors };
  }

  try {
    // Find if username is already registered
    const { name, password } = input;
    // Should be already validated with isEmail
    const email = normalizeEmail(input.email) || '';

    const nameAvailable = await checkIfAvailable('name', name);
    if (!nameAvailable) {
      return {
        success: false,
        errors: { name: m.register.usedName }
      };
    }

    // Find if email is already registered
    const emailAvailable = await checkIfAvailable('email', email);
    if (!emailAvailable) {
      return {
        success: false,
        errors: { email: m.register.usedEmail }
      };
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: ''
    });

    // Hash password before saving in database
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    newUser.password = hash;
    const result = await newUser.save();

    if (result) {
      return {
        success: true,
        id: result.id,
        errors: {}
      };
    } else {
      throw Error('Could not save to database.');
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { name: m.register.service }
    };
  }
};
