export const API_ENDPOINTS = {
  LOGIN: '/Account/login',
  REGISTER: '/Account/register',
  PROFILE: '/Account/profile',
  COURSES: '/api/CourseController/courses',
  COURSE_BY_ID: (id) => `/api/CourseController/course/${id}`,
  LESSON_BY_ID: (id) => `/api/LessonController/${id}`,
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
};