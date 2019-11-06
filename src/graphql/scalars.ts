import { GraphQLBoolean, GraphQLString } from 'graphql';

import { LoginUserProps, RegisterUserProps } from '../models';

export const gqlBoolean = { type: GraphQLBoolean };
export const gqlString = { type: GraphQLString };

export type LoginTypes = Record<keyof LoginUserProps, typeof gqlString>;
export type RegisterTypes = Record<keyof RegisterUserProps, typeof gqlString>;
