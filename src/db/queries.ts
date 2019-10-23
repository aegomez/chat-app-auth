import { User, UserDoc, UserProps } from '../models';

/**
 * Defines a generic function signature with one type
 * argument `T`, and two function arguments.
 * The first function argument must be a valid key of
 * the `User` model. The second argument must be a
 * value of the type assigned to that key.
 * The function returns a Promise of type `T`.
 * @example
 * let foo: UserQuery<string> = function('name', aString) {
 *   // ...
 *   return Promise<'bar'>
 * }
 */
interface UserQuery<T> {
  <K extends keyof UserProps>(key: K, val: UserProps[K]): Promise<T>;
}

/**
 * Find one match in the database. Searches
 * for a value inside of a key/field.
 * @returns A Promise that resolves to the found Document, or null if not found.
 * @throws An Error, if there was a connection issue.
 */
export const findOne: UserQuery<UserDoc | null> = async (key, value) => {
  try {
    return await User.findOne({ [key]: value });
  } catch (error) {
    throw Error('Database error.');
  }
};
