import { VALIDATION_RULES } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  if (email.length > VALIDATION_RULES.EMAIL_MAX_LENGTH) {
    return { isValid: false, message: `Email must be less than ${VALIDATION_RULES.EMAIL_MAX_LENGTH} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters` 
    };
  }
  
  if (username.length > VALIDATION_RULES.USERNAME_MAX_LENGTH) {
    return { 
      isValid: false, 
      message: `Username must be less than ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters` 
    };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters` 
    };
  }
  
  if (password.length > VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be less than ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters` 
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password confirmation
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {Object} Validation result
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate course data
 * @param {Object} course - Course object
 * @returns {Object} Validation result
 */
export const validateCourse = (course) => {
  const errors = {};
  
  if (!course.name?.trim()) {
    errors.name = 'Course name is required';
  } else if (course.name.length > 200) {
    errors.name = 'Course name must be less than 200 characters';
  }
  
  if (!course.description?.trim()) {
    errors.description = 'Course description is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate lesson data
 * @param {Object} lesson - Lesson object
 * @returns {Object} Validation result
 */
export const validateLesson = (lesson) => {
  const errors = {};
  
  if (!lesson.title?.trim()) {
    errors.title = 'Lesson title is required';
  }
  
  if (!lesson.courseId) {
    errors.courseId = 'Please select a course';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate video data
 * @param {Object} video - Video object
 * @returns {Object} Validation result
 */
export const validateVideo = (video) => {
  const errors = {};
  
  if (!video.description?.trim()) {
    errors.description = 'Video description is required';
  }
  
  if (!video.url?.trim()) {
    errors.url = 'Video URL is required';
  } else {
    const videoId = getYoutubeVideoId(video.url);
    if (!videoId) {
      errors.url = 'Invalid YouTube URL';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};