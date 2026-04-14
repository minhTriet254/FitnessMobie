import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.2:5086';

console.log('=== API Configuration ===');
console.log('Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`\n🚀 REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Chỉ log lỗi không phải 401
    if (error.response?.status !== 401) {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - ĐÃ SỬA
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    
    // BỎ QUA 401 errors - không log, không reject (quan trọng!)
    if (status === 401) {
      console.log(`⚠️  Auth required for ${error.config?.url} - skipping error`);
      // Trả về response giả để app không bị crash
      return Promise.resolve({ 
        data: null, 
        status: 401,
        message: 'Authentication required'
      });
    }
    
    // Log các lỗi khác (403, 500, etc)
    if (status !== 403) {
      console.error('❌ Response error:', status, error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;