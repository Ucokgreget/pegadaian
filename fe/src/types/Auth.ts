export interface User {
  id: string | number;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  activePackageName?: string | null;
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
  status: boolean;
  message: string;
  accessToken: string | null;
  refreshToken: string | null;
  rememberToken: string | null;
  user?: User;
}
