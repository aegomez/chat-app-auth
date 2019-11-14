import { GraphQLFieldResolver, GraphQLFieldConfig } from 'graphql';

import { loginResultType, getLoginFields } from './login.types';
import { registerResultType, getRegisterFields } from './register.types';
import { registerResolver, loginResolver } from './resolvers';

type BaseResolver = GraphQLFieldResolver<{}, {}, {}>;

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
