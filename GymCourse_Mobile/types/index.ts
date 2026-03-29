export interface User {
  userName: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterCredentials {
  userName: string;
  email: string;
  password: string;
}

export interface ProfileData {
  height: number;
  weight: number;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  lessonsCount: number;
  canAccess: boolean;
  accessMessage: string;
}

export interface AuthResponse {
  userName: string;
  email: string;
  role: string;
  token: string;
  height?: number;
  weight?: number;
}

export interface ProfileResponse {
  message: string;
  userName: string;
  email: string;
  height: number;
  weight: number;
}

