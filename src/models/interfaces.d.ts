export interface LoginUserProps {
  nameOrEmail: string;
  password: string;
}

export interface RegisterUserProps {
  name: string;
  email: string;
  password: string;
  password2: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  _userId?: string;
  _userName?: string;
}

export interface PasswordProps {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResult {
  success: boolean;
  error: string;
}
