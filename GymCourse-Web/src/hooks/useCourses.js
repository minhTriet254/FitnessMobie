import { useState, useCallback, useEffect } from 'react';
import courseService from '../services/courseService';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../utils/constants';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const { 
    data: coursesData, 
    loading: coursesLoading, 
    error: coursesError,
    execute: fetchCourses 
  } = useFetch(API_ENDPOINTS.COURSES, { immediate: false });

  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
    execute: fetchCourse
  } = useFetch('', { immediate: false });

  const {
    data: lessonData,
    loading: lessonLoading,
    error: lessonError,
    execute: fetchLesson
  } = useFetch('', { immediate: false });

  // Load all courses
  const loadCourses = useCallback(async () => {
    const result = await fetchCourses();
    if (result.success) {
      setCourses(result.data || []);
    }
    return result;
  }, [fetchCourses]);

  // Load single course
  const loadCourse = useCallback(async (id) => {
    const url = API_ENDPOINTS.COURSE_BY_ID(id);
    const result = await fetchCourse({ url });
    if (result.success) {
      setSelectedCourse(result.data);
    }
    return result;
  }, [fetchCourse]);

  // Load lesson
  const loadLesson = useCallback(async (id) => {
    const url = API_ENDPOINTS.LESSON_BY_ID(id);
    const result = await fetchLesson({ url });
    if (result.success) {
      setSelectedLesson(result.data);
    }
    return result;
  }, [fetchLesson]);

  // Clear selections
  const clearSelectedCourse = useCallback(() => {
    setSelectedCourse(null);
  }, []);

  const clearSelectedLesson = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    // Data
    courses,
    selectedCourse,
    selectedLesson,
    
    // Loading states
    loading: coursesLoading || courseLoading || lessonLoading,
    coursesLoading,
    courseLoading,
    lessonLoading,
    
    // Errors
    error: coursesError || courseError || lessonError,
    coursesError,
    courseError,
    lessonError,
    
    // Actions
    loadCourses,
    loadCourse,
    loadLesson,
    clearSelectedCourse,
    clearSelectedLesson,
    setCourses,
    setSelectedCourse,
    setSelectedLesson,
  };
};