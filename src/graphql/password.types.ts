import { GraphQLObjectType } from 'graphql';

import { gqlBoolean, gqlString, UpdatePasswordTypes } from './scalars';

export function getPasswordFields(): UpdatePasswordTypes {
  return {
    oldPassword: gqlString,
    newPassword: gqlString
  };
}

export const updatePasswordResultType = new GraphQLObjectType({
  name: 'UpdatePasswordResult',
  description: 'Return a success flag and an error message.',
  fields: () => ({
    success: gqlBoolean,
    error: gqlString
  })
});
