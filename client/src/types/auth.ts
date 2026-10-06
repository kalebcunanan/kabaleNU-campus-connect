export type UserRole = 'bulldog' | 'bullpup' | 'faculty';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  program?: string;
  profilePicture?: string;
  bulldogScore: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: FormData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}