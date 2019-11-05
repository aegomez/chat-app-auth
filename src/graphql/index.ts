import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLFieldResolver,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  validateLoginInput,
  validateRegisterInput,
  checkIfAvailable
} from '../validation';
import { findOne } from '../db';
import { User } from '../models';

const secretOrKey = process.env.JWT_SECRET;

interface RegisterUserProps {
  name: string;
  email: string;
  password: string;
  password2: string;
}

type ScalarFieldsMap<S extends string> = Record<S, { type: GraphQLScalarType }>;

/**
 * Create a GraphQL FieldConfigMap, taking a number
 * of string arguments and returning an object
 * where those arguments are scalar properties of
 * type GraphQLString.
 * @param fields Any number of field names.
 */
function createFields<S extends string>(...fields: S[]): ScalarFieldsMap<S> {
  return fields.reduce(
    (map, field) => {
      map[field] = { type: GraphQLString };
      return map;
    },
    {} as ScalarFieldsMap<S>
  );
}

type RegisterKeys = keyof RegisterUserProps;

const registerUserType = new GraphQLInputObjectType({
  name: 'RegisterUser',
  description: 'Data required to register an user.',
  fields: () =>
    createFields<RegisterKeys>('name', 'email', 'password', 'password2')
});

interface LoginUserProps {
  nameOrEmail: string;
  password: string;
}

type LoginKeys = keyof LoginUserProps;

const loginUserType = new GraphQLInputObjectType({
  name: 'LoginUser',
  description: 'Data required to login an user.',
  fields: () => createFields<LoginKeys>('nameOrEmail', 'password')
});

const loginResultType = new GraphQLObjectType({
  name: 'LoginUserMutationResult',
  fields: () => ({
    success: { type: GraphQLBoolean },
    token: { type: GraphQLString },
    errors: {
      type: new GraphQLObjectType({
        name: 'LoginUserErrors',
        fields: () => createFields<LoginKeys>('nameOrEmail', 'password')
      })
    }
  })
});

const registerResultType = new GraphQLObjectType({
  name: 'RegisterUserMutationResult',
  fields: () => ({
    success: { type: GraphQLBoolean },
    errors: {
      type: new GraphQLObjectType({
        name: 'RegisterUserErrors',
        fields: () =>
          createFields<RegisterKeys>('name', 'email', 'password', 'password2')
      })
    }
  })
});

/**
 * Map properties from a dictionary `D` to the
 * `args.datadata` parameter of the resolver function
 * and replace its return type for a custom object.
 */
type CustomResolver<D> = (
  ...args: Parameters<GraphQLFieldResolver<{}, {}, { datadata: D }>>
) => Promise<{
  success: boolean;
  errors: Partial<D>;
  token?: string;
}>;

const loginResolver: CustomResolver<LoginUserProps> = async (
  _source,
  { datadata }
) => {
  console.log('>> name: ', datadata.nameOrEmail);
  console.log('>> pass: ', datadata.password);
  // Form validation and sanitization
  const { isValid, isName, errors } = validateLoginInput(datadata);
  console.log('>> Validation: ', isValid, isName, errors);

  // Return if the fields are not valid
  if (!isValid) {
    return { success: false, errors };
  }

  const { nameOrEmail, password } = datadata;
  const key = isName ? 'name' : 'email';

  try {
    // Find user by email or name
    const user = await findOne(key, nameOrEmail);

    if (!user) {
      return {
        success: false,
        errors: { nameOrEmail: 'User not found.' }
      };
    }

    // If user exists, check the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        success: false,
        errors: { password: 'Incorrect password' }
      };
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name
    };

    // Sign token
    const token = jwt.sign(payload, secretOrKey as string, {
      expiresIn: '1d',
      issuer: 'accounts.chat.app'
    });

    return {
      success: true,
      token: 'Bearer ' + token,
      errors: {}
    };
  } catch (error) {
    return {
      success: false,
      errors: { nameOrEmail: 'Login service is unavailable' }
    };
  }
};

const registerResolver: CustomResolver<RegisterUserProps> = async (
  _source,
  { datadata }
) => {
  console.log('>> name: ', datadata.name);
  console.log('>> mail: ', datadata.email);
  console.log('>> pass: ', datadata.password);
  console.log('>> pa22: ', datadata.password2);

  // Form validation and sanitization
  const { isValid, errors } = validateRegisterInput(datadata);

  if (!isValid) {
    return { success: false, errors };
  }

  try {
    // Find if username is already registered
    const { name, email, password } = datadata;

    const nameAvailable = await checkIfAvailable('name', name);
    if (!nameAvailable) {
      return {
        success: false,
        errors: { name: 'Username is not available' }
      };
    }

    // Find if email is already registered
    const emailAvailable = await checkIfAvailable('email', email);
    if (!emailAvailable) {
      return {
        success: false,
        errors: { name: 'Email is already registered.' }
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
        errors: {}
      };
    } else {
      throw Error('Could not save to database.');
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { name: 'Registration service is unavailable.' }
    };
  }
};

type BaseResolver = GraphQLFieldResolver<{}, {}, {}>;

const authQueryRootType = new GraphQLObjectType({
  name: 'AuthQuery',
  fields: () => ({
    any: {
      type: GraphQLString,
      resolve: () => 'Not implemented.'
    }
  })
});

const authMutationRootType = new GraphQLObjectType({
  name: 'AuthMutation',
  fields: () => ({
    register: {
      type: registerResultType,
      args: {
        datadata: { type: registerUserType }
      },
      resolve: registerResolver as BaseResolver
    },
    login: {
      type: loginResultType,
      args: {
        datadata: { type: loginUserType }
      },
      resolve: loginResolver as BaseResolver
    }
  })
});

export const authSchema = new GraphQLSchema({
  query: authQueryRootType,
  mutation: authMutationRootType
});
