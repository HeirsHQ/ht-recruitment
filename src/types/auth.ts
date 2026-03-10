import { User } from "./user";

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  token: string;
}
