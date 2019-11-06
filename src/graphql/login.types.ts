import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';

import { gqlBoolean, gqlString, LoginTypes } from './scalars';

function getLoginFields(): LoginTypes {
  return {
    nameOrEmail: gqlString,
    password: gqlString
  };
}

export const loginUserType = new GraphQLInputObjectType({
  name: 'LoginUser',
  description: 'Data required to login an user.',
  fields: getLoginFields
});

export const loginResultType = new GraphQLObjectType({
  name: 'LoginUserMutationResult',
  fields: () => ({
    success: gqlBoolean,
    token: gqlString,
    errors: {
      type: new GraphQLObjectType({
        name: 'LoginUserErrors',
        fields: getLoginFields
      })
    }
  })
});
