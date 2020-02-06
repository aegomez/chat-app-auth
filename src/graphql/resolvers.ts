import { GraphQLFieldResolver } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { normalizeEmail, isLength } from 'validator';
import { parse } from 'cookie';
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
  PasswordProps,
  PasswordResult,
  VerifyTokenResult
} from '../models';
import { findOne, findById } from '../db';

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
  args,
  context
) => {
  const { isValid, isName, errors } = validateLoginInput(args);

  // Return if the fields are not valid
  if (!isValid) {
    return { success: false, errors };
  }

  try {
    const key = isName ? 'name' : 'email';
    let nameOrEmail = args.nameOrEmail;

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
    const isMatch = await bcrypt.compare(args.password, user.password);
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
  args
) => {
  const { isValid, errors } = validateRegisterInput(args);

  // Return if the fields are not valid
  if (!isValid) {
    return { success: false, errors };
  }

  try {
    // Find if username is already registered
    const { name, password } = args;
    // Should be already validated with isEmail
    const email = normalizeEmail(args.email) || '';

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

function verifyToken(token: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secretOrKey,
      {
        algorithms: ['HS256'],
        issuer: 'accounts.chat.app',
        subject: 'client@chat.app'
      },
      (error, decoded) => {
        if (error) return reject(error);
        if (typeof decoded === 'string') {
          resolve(null);
        } else {
          const { chatId } = decoded as { chatId: string };
          resolve(chatId);
        }
      }
    );
  });
}

export const verifyTokenResolver: GraphQLFieldResolver<
  {},
  {},
  { token: string }
> = async (_source, args): Promise<VerifyTokenResult> => {
  try {
    // Verify token validity
    const chatId = await verifyToken(args.token);
    if (!chatId) throw Error('invalid token');

    // If valid, search for the user data
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

export const updatePasswordResolver: GraphQLFieldResolver<
  {},
  { cookie?: string },
  PasswordProps
> = async (_source, args, context): Promise<PasswordResult> => {
  try {
    const NOT_AUTHORIZED = 'NOT_AUTHORIZED';

    // Validate the new password
    const { oldPassword, newPassword } = args;
    if (!oldPassword || !newPassword) {
      throw Error('password.required');
    }
    if (!isLength(newPassword, { min: 6, max: 99 })) {
      throw Error('password.length');
    }

    // Old and new passwords must be different
    if (oldPassword === newPassword) {
      throw Error('password.unchanged');
    }

    // Extract the token from the cookie
    const cookie = parse(context.cookie || '');
    if (!cookie.token) {
      throw Error(NOT_AUTHORIZED);
    }

    // Verify the token's validity
    const token = cookie.token.replace('Bearer ', '');
    const chatId = await verifyToken(token);
    if (!chatId) {
      throw Error(NOT_AUTHORIZED);
    }

    // Find the user
    const user = await findById(chatId);
    if (!user) {
      throw Error(NOT_AUTHORIZED);
    }

    // If the user exists, check the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw Error('password.incorrect');
    }

    // All tests passed: hash and update the new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    user.password = hash;
    await user.save();

    return { success: true, error: '' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};
