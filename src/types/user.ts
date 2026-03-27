export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  companies: string[];
}
