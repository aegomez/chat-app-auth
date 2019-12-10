import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { loginMutation, registerMutation } from './mutations';
import { verifyTokenQuery } from './queries';

const authQueryRootType = new GraphQLObjectType({
  name: 'AuthQuery',
  fields: () => ({
    verify: verifyTokenQuery
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
