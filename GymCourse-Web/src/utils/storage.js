import { STORAGE_KEYS } from './constants';

export const storage = {
  setToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  
  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
  
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};