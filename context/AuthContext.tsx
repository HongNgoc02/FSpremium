import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';

export interface User {
  id: number;
  phone_number: string;
  email: string;
  fullname: string;
  address?: string;
  role_name: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone_number: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullname: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (userData && token) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone_number: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await userAPI.login({ phone_number, password });
      const userData = response.data.user;
      const token = response.data.token;

      // Lưu user và token vào AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Số điện thoại hoặc mật khẩu không đúng';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: {
    fullname: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Thêm role_name như web
      const registerData = {
        ...data,
        role_name: 'customer', // Mặc định là customer như web
      };
      
      const response = await userAPI.register(registerData);
      const userData = response.data.user;
      
      // Sau khi đăng ký thành công, tự động đăng nhập
      const loginResponse = await userAPI.login({
        phone_number: data.phone_number,
        password: data.password,
      });
      
      const token = loginResponse.data.token;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      // Lấy message từ backend hoặc dùng message mặc định
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

