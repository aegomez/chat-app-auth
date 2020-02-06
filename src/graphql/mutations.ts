import { GraphQLFieldResolver, GraphQLFieldConfig } from 'graphql';

import { loginResultType, getLoginFields } from './login.types';
import { registerResultType, getRegisterFields } from './register.types';
import {
  registerResolver,
  loginResolver,
  updatePasswordResolver
} from './resolvers';
import { updatePasswordResultType, getPasswordFields } from './password.types';

export type BaseResolver = GraphQLFieldResolver<{}, {}, {}>;

type FieldConfig = GraphQLFieldConfig<{}, {}>;

export const loginMutation: FieldConfig = {
  type: loginResultType,
  args: getLoginFields(),
  resolve: loginResolver as BaseResolver
};

export const registerMutation: FieldConfig = {
  type: registerResultType,
  args: getRegisterFields(),
  resolve: registerResolver as BaseResolver
};

export const updatePasswordMutation: FieldConfig = {
  type: updatePasswordResultType,
  args: getPasswordFields(),
  resolve: updatePasswordResolver as BaseResolver
};
