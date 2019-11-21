import { GraphQLObjectType } from 'graphql';

import { gqlBoolean, gqlString, LoginTypes } from './scalars';

export function getLoginFields(): LoginTypes {
  return {
    nameOrEmail: gqlString,
    password: gqlString
  };
}

export const loginResultType = new GraphQLObjectType({
  name: 'LoginUserMutationResult',
  description:
    'The result of the login action. Returns a token if successful or an errors object if not.',
  fields: () => ({
    success: gqlBoolean,
    id: gqlString,
    errors: {
      type: new GraphQLObjectType({
        name: 'LoginUserErrors',
        fields: getLoginFields
      })
    }
  })
});
