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
import {
  User,
  LoginUserProps,
  RegisterUserProps,
  VerifyTokenResult
} from '../models';
import { findOne, findById } from '../db';

/* Complete error messages are now replaced in the client. */

const secretOrKey = process.env.JWT_SECRET || 'not defined';

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
        errors: {
          nameOrEmail: 'login.incorrect',
          password: 'login.incorrect'
        }
      };
    }

    // If user exists, check the password
    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      return {
        success: false,
        errors: {
          nameOrEmail: 'login.incorrect',
          password: 'login.incorrect'
        }
      };
    }

    // Create JWT payload
    const payload = {
      chatId: user.id
    };
    // Sign token
    const token = jwt.sign(payload, secretOrKey as string, {
      expiresIn: '1d',
      issuer: 'accounts.chat.app',
      subject: 'client@chat.app'
    });

    // Tell the client to set a cookie with the token
    context.response.cookie('token', 'Bearer ' + token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    // Return some data to the client
    return {
      success: true,
      id: '',
      errors: {}
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        nameOrEmail: 'login.service',
        password: 'login.service'
      }
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
        errors: { name: 'register.usedName' }
      };
    }

    // Find if email is already registered
    const emailAvailable = await checkIfAvailable('email', email);
    if (!emailAvailable) {
      return {
        success: false,
        errors: { email: 'register.usedEmail' }
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
      errors: { name: 'register.service' }
    };
  }
};

export const verifyTokenResolver: GraphQLFieldResolver<
  {},
  {},
  { token: string }
> = async (_source, input): Promise<VerifyTokenResult> => {
  try {
    // Verify token validity
    const result = jwt.verify(input.token, secretOrKey, {
      algorithms: ['HS256'],
      issuer: 'accounts.chat.app',
      subject: 'client@chat.app'
    });
    if (typeof result === 'string') throw Error('invalid token');

    // If valid, search for the user data
    const { chatId } = result as { chatId: string };
    const user = await findById(chatId);
    if (user === null) throw Error('user in token not found');

    // return the data to requester
    return {
      valid: true,
      _userId: user.id,
      _userName: user.name
    };
  } catch (e) {
    return {
      valid: false
    };
  }
};
