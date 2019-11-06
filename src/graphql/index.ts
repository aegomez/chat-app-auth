import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { loginMutation, registerMutation } from './mutations';
import { gqlString } from './scalars';

const authQueryRootType = new GraphQLObjectType({
  name: 'AuthQuery',
  description: 'Not implemented.',
  fields: () => ({
    any: gqlString
  })
});

const authMutationRootType = new GraphQLObjectType({
  name: 'AuthMutation',
  fields: () => ({
    login: loginMutation,
    register: registerMutation
  })
});

export const authSchema = new GraphQLSchema({
  query: authQueryRootType,
  mutation: authMutationRootType
});
