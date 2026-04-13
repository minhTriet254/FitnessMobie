export interface User {
  userName: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
  isPremium?: boolean;
  premiumExpiryDate?: string | null;
  daysRemaining?: number;
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
  token: string;
  userName: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
  isPremium?: boolean;
  premiumExpiryDate?: string | null;
  daysRemaining?: number;
}

export interface ProfileResponse {
  message: string;
  userName: string;
  email: string;
  height: number;
  weight: number;
}

export interface Lesson {
  id: number;
  title: string;
  content?: string;
}

export interface CourseDetailDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  startDate: string;
  endDate: string;
  lessons: Lesson[];
}

export interface PremiumError {
  success: boolean;
  message: string;
  requiresPremium: boolean;
  price: number;
}
export interface User {
  userName: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
  isPremium?: boolean;
  premiumExpiryDate?: string | null;
  daysRemaining?: number;
}

export interface ProfileData {
  height: number;
  weight: number;
}

export interface PremiumStatusResponse {
  success: boolean;
  isPremium: boolean;
  expiryDate: string | null;
  daysRemaining: number;
  userName: string;
  email: string;
}