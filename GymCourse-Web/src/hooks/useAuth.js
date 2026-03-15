import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import { storage } from '../utils/storage';
import { ROLES } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const token = storage.getToken();
      const savedUser = storage.getUser();
      
      if (token && savedUser) {
        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();
          
          if (isExpired) {
            logout();
          } else {
            setUser(savedUser);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Login
  const login = useCallback(async (userName, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(userName, password);
      
      const userData = {
        userName: data.userName,
        email: data.email,
        role: data.role,
      };
      
      storage.setToken(data.token);
      storage.setUser(userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.response?.data || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (userName, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userName, email, password);
      
      const userData = {
        userName: data.userName,
        email: data.email,
        role: data.role,
      };
      
      storage.setToken(data.token);
      storage.setUser(userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.response?.data || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    storage.clearAll();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // Check if user has role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole(ROLES.ADMIN);
  }, [hasRole]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
  };
};