import { GraphQLObjectType } from 'graphql';

import { gqlBoolean, gqlString, VerifyTokenTypes } from './scalars';

export const verifyTokenResultType = new GraphQLObjectType({
  name: 'VerifyTokenQueryResult',
  description:
    'Returns a boolean to indicate a valid token, and some data if valid.',
  fields: (): VerifyTokenTypes => ({
    valid: gqlBoolean,
    _userId: gqlString,
    _userName: gqlString
  })
});
