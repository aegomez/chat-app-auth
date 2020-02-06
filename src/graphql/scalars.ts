import { GraphQLBoolean, GraphQLString, GraphQLScalarType } from 'graphql';

import {
  LoginUserProps,
  RegisterUserProps,
  PasswordProps,
  VerifyTokenResult
} from '../models';

export const gqlBoolean = { type: GraphQLBoolean };
export const gqlString = { type: GraphQLString };

type FieldTypes<T> = Record<keyof T, { type: GraphQLScalarType }>;

export type LoginTypes = FieldTypes<LoginUserProps>;
export type RegisterTypes = FieldTypes<RegisterUserProps>;

export type VerifyTokenTypes = FieldTypes<VerifyTokenResult>;

export type UpdatePasswordTypes = FieldTypes<PasswordProps>;
