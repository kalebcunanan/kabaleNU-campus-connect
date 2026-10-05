import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/axios';
import type { AuthContextValue, LoginPayload, RegisterPayload, User } from '../types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;

    // Restores the session from the httpOnly cookie on every page load.
    const restoreSession = async (): Promise<void> => {
      try {
        const { data } = await api.get<User>('/users/me');
        if (isActive) setUser(data);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const { data } = await api.post<User>('/users/login', payload);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    const { data } = await api.post<User>('/users/register', payload);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/users/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: user !== null, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
