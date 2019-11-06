import { GraphQLFieldResolver, GraphQLFieldConfig } from 'graphql';

import { loginResultType, loginUserType } from './login.types';
import { registerResultType, registerUserType } from './register.types';
import { registerResolver, loginResolver } from './resolvers';

type BaseResolver = GraphQLFieldResolver<{}, {}, {}>;

type FieldConfig = GraphQLFieldConfig<{}, {}>;

export const loginMutation: FieldConfig = {
  type: loginResultType,
  args: {
    input: { type: loginUserType }
  },
  resolve: loginResolver as BaseResolver
};

export const registerMutation: FieldConfig = {
  type: registerResultType,
  args: {
    input: { type: registerUserType }
  },
  resolve: registerResolver as BaseResolver
};
