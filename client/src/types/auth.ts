export type UserRole = 'bulldog' | 'bullpup' | 'faculty';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  bulldogScore: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'faculty'>;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}
