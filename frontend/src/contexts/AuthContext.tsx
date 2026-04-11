import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authAPI, userAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  users: User[];
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'project_flow_user';
const TOKEN_KEY = 'token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      refreshUsers();
    }
  }, [user]);

  const refreshUsers = async () => {
    try {
      const { data } = await userAPI.getUsers();
      // Map _id to id
      const mappedUsers = data.map((u: any) => ({ ...u, id: u._id }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data } = await authAPI.login({ email, password });
      const userData: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        createdAt: new Date(), // This will be updated from backend if needed
      };
      
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  const signup = async (
    name: string, email: string, password: string, role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data } = await authAPI.register({ name, email, password, role });
      const userData: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        createdAt: new Date(),
      };
      
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAdmin, users, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

