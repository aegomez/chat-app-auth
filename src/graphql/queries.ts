import { GraphQLFieldConfig } from 'graphql';

import { gqlString } from './scalars';
import { verifyTokenResolver } from './resolvers';
import { verifyTokenResultType } from './verify.types';
import { BaseResolver } from './mutations';

export const verifyTokenQuery: GraphQLFieldConfig<{}, {}> = {
  type: verifyTokenResultType,
  args: {
    token: gqlString
  },
  resolve: verifyTokenResolver as BaseResolver
};
