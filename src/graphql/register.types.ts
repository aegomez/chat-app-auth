import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';

import { gqlBoolean, gqlString, RegisterTypes } from './scalars';

function getRegisterFields(): RegisterTypes {
  return {
    name: gqlString,
    email: gqlString,
    password: gqlString,
    password2: gqlString
  };
}

export const registerUserType = new GraphQLInputObjectType({
  name: 'RegisterUser',
  description: 'Data required to register an user.',
  fields: getRegisterFields
});

export const registerResultType = new GraphQLObjectType({
  name: 'RegisterUserMutationResult',
  fields: () => ({
    success: gqlBoolean,
    errors: {
      type: new GraphQLObjectType({
        name: 'RegisterUserErrors',
        fields: getRegisterFields
      })
    }
  })
});
