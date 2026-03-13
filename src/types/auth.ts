import { User } from "./user";

export interface SignInDto {
  username: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  token: string;
}
