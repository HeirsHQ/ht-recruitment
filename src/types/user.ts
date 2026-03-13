export type UserStatus = "active" | "inactive";

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}
