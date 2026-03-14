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
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  rememberToken?: string | null;
  refreshToken?: string | null;
  status: boolean;
  message: string;
  token?: string;
  user?: User;
}
