import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  ProfileData,
} from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  updateProfile: (profileData: ProfileData) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isNewUser: boolean;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const newUserFlag = await AsyncStorage.getItem('isNewUser');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData) as User;
        console.log('✅ User loaded:', parsedUser);
        setUser(parsedUser);
        setIsNewUser(newUserFlag === 'true');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Check auth status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null);
      console.log('🔐 Login with:', credentials.userName);
      
      const response = await api.post<AuthResponse>('/Account/Login', null, {
        params: {
          UserName: credentials.userName,
          Password: credentials.password
        }
      });
      
      const { token, ...userData } = response.data;
      
      const userObject: User = {
        userName: userData.userName,
        email: userData.email,
        role: userData.role,
        height: userData.height,
        weight: userData.weight
      };
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userObject));
      
      // Login: không phải user mới
      await AsyncStorage.removeItem('isNewUser');
      setIsNewUser(false);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userObject);
      
      console.log('✅ Login successful');
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data);
      let errorMessage = 'Đăng nhập thất bại';
      if (error.response?.data === 'Invalid username') {
        errorMessage = 'Tên đăng nhập không tồn tại';
      } else if (error.response?.data === 'Invalid password') {
        errorMessage = 'Mật khẩu không chính xác';
      }
      setError(errorMessage);
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setError(null);
      console.log('📝 Register with:', credentials.userName);
      
      const response = await api.post<AuthResponse>('/Account/Register', null, {
        params: {
          UserName: credentials.userName,
          Email: credentials.email,
          Password: credentials.password
        }
      });
      
      const { token, ...userData } = response.data;
      
      const userObject: User = {
        userName: userData.userName,
        email: userData.email,
        role: userData.role,
        height: userData.height,
        weight: userData.weight
      };
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userObject));
      
      // Register: đánh dấu là user mới (cần nhập profile)
      await AsyncStorage.setItem('isNewUser', 'true');
      setIsNewUser(true);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userObject);
      
      console.log('✅ Register successful, isNewUser=true');
      return true;
    } catch (error: any) {
      console.error('❌ Register error:', error.response?.data);
      setError('Đăng ký thất bại');
      return false;
    }
  };

  const updateProfile = async (profileData: ProfileData): Promise<boolean> => {
    try {
      setError(null);
      console.log('📝 Updating profile:', profileData);
      
      await api.post('/Account/profile', null, {
        params: {
          Height: profileData.height,
          Weight: profileData.weight
        }
      });
      
      if (user) {
        const updatedUser: User = {
          ...user,
          height: profileData.height,
          weight: profileData.weight
        };
        
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Xóa flag user mới sau khi nhập profile thành công
        await AsyncStorage.removeItem('isNewUser');
        setIsNewUser(false);
        
        console.log('✅ Profile updated, isNewUser cleared');
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Profile update error:', error.response?.data);
      setError('Cập nhật profile thất bại');
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('isNewUser');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsNewUser(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user,
        isNewUser,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};