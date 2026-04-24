import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.3:5086';

console.log('=== API Configuration ===');
console.log('Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', 
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`\n🚀 REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📤 Request Data:', config.data); // Log data gửi đi
    console.log('📤 Request Params:', config.params); // Log params
    
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - SỬA LẠI
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.status} ${response.config.url}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    
    // Log chi tiết lỗi
    console.error(`❌ Response error [${status}]:`, {
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      status: status,
    });
    
    // Xử lý 401 - Unauthorized
    if (status === 401) {
      console.log('⚠️  Unauthorized - Redirecting to login');
      // Không resolve với data null, mà reject để component xử lý
      // Component có thể redirect về login
    }
    
    // Với lỗi 400, trả về response để component có thể đọc error.response.data
    if (status === 400) {
      console.log('⚠️  Bad Request - Validation error');
      console.log('Validation errors:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;