import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';

interface User {
  userName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userName: string, password: string) => {
    try {
      const data = await authApi.login(userName, password);
      
      await AsyncStorage.setItem('accessToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        userName: data.userName,
        email: data.email,
        role: data.role
      }));
      
      setUser({
        userName: data.userName,
        email: data.email,
        role: data.role
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data || 'Đăng nhập thất bại'
      };
    }
  };

  const register = async (userName: string, email: string, password: string) => {
    try {
      const data = await authApi.register(userName, email, password);
      
      await AsyncStorage.setItem('accessToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        userName: data.userName,
        email: data.email,
        role: data.role
      }));
      
      setUser({
        userName: data.userName,
        email: data.email,
        role: data.role
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data || 'Đăng ký thất bại'
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Đăng xuất thất bại' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};