export interface User {
  id: string | number;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  createdAt?: string;
  updatedAt?: string;
  subscriptions?: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
  user?: User;
}
