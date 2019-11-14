import { GraphQLObjectType } from 'graphql';

import { gqlBoolean, gqlString, RegisterTypes } from './scalars';

export function getRegisterFields(): RegisterTypes {
  return {
    name: gqlString,
    email: gqlString,
    password: gqlString,
    password2: gqlString
  };
}

export const registerResultType = new GraphQLObjectType({
  name: 'RegisterUserMutationResult',
  description: 'The result of the register action. Returns an errors object if not successful.',
  fields: () => ({
    success: gqlBoolean,
    id: gqlString,
    errors: {
      type: new GraphQLObjectType({
        name: 'RegisterUserErrors',
        fields: getRegisterFields
      })
    }
  })
});
