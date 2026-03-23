import axios from 'axios';

const API_URL = 'http://192.168.1.9:5000/account';

export const loginApi = async (username: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, {
    userName: username,
    password: password,
  });

  return res.data;
};