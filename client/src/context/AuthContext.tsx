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

  const restoreSession = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.get<User>('/users/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // Reloads the user so score changes show up without touching the loading flag.
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.get<User>('/users/me');
      setUser(data);
    } catch {
      // A failed background refresh keeps the current user on screen.
    }
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
    } catch {
      // An expired cookie returns 401, and the user is logged out locally either way.
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: user !== null, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
