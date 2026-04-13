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
  const status = error?.response?.status;

  if (status !== 403) {
    console.error('❌ Response error:', status, error.message);
  }

  return Promise.reject(error);
}
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
(error) => {
  const status = error?.response?.status;

  if (status !== 403) {
    console.error('❌ Response error:', status, error.message);
  }

  return Promise.reject(error);
}
);

export default api;