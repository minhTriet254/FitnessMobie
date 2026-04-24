// ============ Auth Types ============
export interface User {
  userName: string;
  email: string;
  role: string;
  gender?: string;
  height?: number;
  weight?: number;
  isPremium: boolean;
  premiumExpiryDate: string | null;
  daysRemaining: number;
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

export interface AuthResponse {
  token: string;
  userName: string;
  email: string;
  role: string;
  gender?: string;
  height?: number;
  weight?: number;
  isPremium: boolean;
  premiumExpiryDate: string | null;
  daysRemaining: number;
}

// ============ Profile Types ============
export interface ProfileData {
  gender: string;
  height: number;
  weight: number;
}

export interface ProfileResponse {
  message: string;
  userName: string;
  email: string;
  gender?: string;
  height: number;
  weight: number;
}

// ============ Premium Types ============
export interface PremiumStatusResponse {
  success: boolean;
  isPremium: boolean;
  expiryDate: string | null;
  daysRemaining: number;
  userName: string;
  email: string;
}

export interface PremiumError {
  success: boolean;
  message: string;
  requiresPremium: boolean;
  price: number;
}

// ============ Course Types ============
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

export interface CourseDetailDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  startDate: string;
  endDate: string;
  lessons: Lesson[];
}

// ============ Lesson Types ============
export interface Lesson {
  id: number;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  isCompleted?: boolean;
}

// ============ Payment Types ============
export interface PaymentRequest {
  amount: number;
  paymentMethod: string;
  returnUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface PaymentVerificationRequest {
  transactionId: string;
  paymentStatus: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  isPremium: boolean;
  expiryDate: string | null;
}

// ============ API Response Types ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ Common Types ============
export type Gender = 'male' | 'female' | 'other';

export interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

// ============ Navigation Types ============
export type RootStackParamList = {
  login: undefined;
  register: undefined;
  profile: undefined;
  premium: undefined;
  '(tabs)': undefined;
  courseDetail: { courseId: number };
  lessonDetail: { lessonId: number; courseId: number };
  payment: { courseId?: number };
};

export type TabParamList = {
  home: undefined;
  courses: undefined;
  profile: undefined;
  premium: undefined;
};

// ============ Form Types ============
export interface ProfileFormData {
  gender: Gender;
  height: string;
  weight: string;
}

export interface LoginFormData {
  userName: string;
  password: string;
}

export interface RegisterFormData {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============ Validation Types ============
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}