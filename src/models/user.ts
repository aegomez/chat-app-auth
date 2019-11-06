import {
  createSchema,
  Type,
  typedModel,
  ExtractProps,
  ExtractDoc
} from 'ts-mongoose';

const UserSchema = createSchema({
  name: Type.string({ required: true }),
  email: Type.string({ required: true }),
  password: Type.string({ required: true }),
  date: Type.date({ default: Date.now })
});

export const User = typedModel('users', UserSchema);
export type UserProps = ExtractProps<typeof UserSchema>;
export type UserDoc = ExtractDoc<typeof UserSchema>;
