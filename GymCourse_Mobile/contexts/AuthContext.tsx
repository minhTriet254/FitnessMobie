import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ProfileData,
  PremiumStatusResponse,
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
  isAdmin: boolean;
  refreshPremiumStatus: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const buildUserObject = (data: Partial<User>): User => {
    return {
      userName: data.userName || '',
      email: data.email || '',
      role: data.role || 'User',
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      isPremium: data.isPremium ?? false,
      premiumExpiryDate: data.premiumExpiryDate ?? null,
      daysRemaining: data.daysRemaining ?? 0,
    };
  };

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

        const admin =
          parsedUser.role === 'Admin' ||
          parsedUser.role === 'admin' ||
          (parsedUser.role && parsedUser.role.includes('Admin')) ||
          false;

        setIsAdmin(admin);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Tự refresh premium từ server để tránh dùng dữ liệu cũ
        await refreshPremiumStatus();
      }
    } catch (error) {
      console.error('❌ Check auth status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPremiumStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (!token || !userData) return;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const localUser = JSON.parse(userData) as User;
      const res = await api.get<PremiumStatusResponse>('/api/Premium/check-status');

      if (res.data?.success) {
        const updatedUser: User = {
          ...localUser,
          email: res.data.email || localUser.email,
          userName: res.data.userName || localUser.userName,
          isPremium: res.data.isPremium,
          premiumExpiryDate: res.data.expiryDate,
          daysRemaining: res.data.daysRemaining,
        };

        console.log('✅ Premium status refreshed:', updatedUser);

        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

        const admin =
          updatedUser.role === 'Admin' ||
          updatedUser.role === 'admin' ||
          (updatedUser.role && updatedUser.role.includes('Admin')) ||
          false;

        setIsAdmin(admin);
      }
    } catch (error: any) {
      console.error('❌ Refresh premium status error:', error?.response?.data || error?.message || error);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null);
      console.log('🔐 Login with:', credentials.userName);

      const response = await api.post<AuthResponse>('/Account/Login', null, {
        params: {
          UserName: credentials.userName,
          Password: credentials.password,
        },
      });

      const { token, ...userData } = response.data;

      const userObject: User = buildUserObject({
        userName: userData.userName,
        email: userData.email,
        role: userData.role,
        height: userData.height,
        weight: userData.weight,
        isPremium: userData.isPremium,
        premiumExpiryDate: userData.premiumExpiryDate,
        daysRemaining: userData.daysRemaining,
      });

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userObject));
      await AsyncStorage.removeItem('isNewUser');

      setIsNewUser(false);

      const admin =
        userObject.role === 'Admin' ||
        userObject.role === 'admin' ||
        (userObject.role && userObject.role.includes('Admin')) ||
        false;

      setIsAdmin(admin);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userObject);

      // Refresh để đồng bộ premium thật từ server
      await refreshPremiumStatus();

      console.log('✅ Login successful, isAdmin:', admin);
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
          Password: credentials.password,
        },
      });

      const { token, ...userData } = response.data;

      const userObject: User = buildUserObject({
        userName: userData.userName,
        email: userData.email,
        role: userData.role,
        height: userData.height,
        weight: userData.weight,
        isPremium: userData.isPremium,
        premiumExpiryDate: userData.premiumExpiryDate,
        daysRemaining: userData.daysRemaining,
      });

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userObject));
      await AsyncStorage.setItem('isNewUser', 'true');

      setIsNewUser(true);
      setIsAdmin(false);

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

    // Thay đổi từ params sang body
    await api.post('/Account/profile', {
      gender: profileData.gender, // Thêm gender
      height: profileData.height,
      weight: profileData.weight,
    });

    if (user) {
      const updatedUser: User = {
        ...user,
        gender: profileData.gender, // Thêm gender
        height: profileData.height,
        weight: profileData.weight,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);

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
      setIsAdmin(false);

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
        isAdmin,
        checkAuthStatus,
        refreshPremiumStatus,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};