import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/integrations/mongodb';
import { socketClient } from '@/integrations/mongodb/socket';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();

      if (token) {
        try {
          const { user: userData } = await api.getMe();
          setUser(userData);

          // Connect socket after auth
          socketClient.connect();
        } catch (error) {
          // Token expired or invalid
          console.error('Auth init error:', error);
          api.setToken(null);
        }
      }

      setLoading(false);
    };

    initAuth();

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const { user: userData } = await api.register(email, password, fullName, phone);
      setUser(userData);
      socketClient.connect();
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Registration failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: userData } = await api.login(email, password);
      setUser(userData);
      socketClient.connect();
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Login failed') };
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      socketClient.disconnect();
    }
  };

  const refreshUser = async () => {
    try {
      const { user: userData } = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
