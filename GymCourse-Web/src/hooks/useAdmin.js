import { useState, useCallback } from 'react';
import adminService from '../services/adminService';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../utils/constants';

export const useAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    execute: executeCreate,
    loading: createLoading,
  } = useFetch('', { immediate: false });

  const {
    execute: executeUpdate,
    loading: updateLoading,
  } = useFetch('', { immediate: false });

  const {
    execute: executeDelete,
    loading: deleteLoading,
  } = useFetch('', { immediate: false });

  // User Management
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data || 'Failed to load users';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId, role) => {
    setError(null);
    
    try {
      const data = await adminService.updateUserRole(userId, role);
      await loadUsers(); // Refresh users list
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data || 'Failed to update user role';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [loadUsers]);

  // Course Management
  const createCourse = useCallback(async (courseData) => {
    const result = await executeCreate({
      url: API_ENDPOINTS.COURSES,
      method: 'POST',
      body: courseData,
    });
    return result;
  }, [executeCreate]);

  const updateCourse = useCallback(async (id, courseData) => {
    const result = await executeUpdate({
      url: API_ENDPOINTS.COURSE_BY_ID(id),
      method: 'PUT',
      body: courseData,
    });
    return result;
  }, [executeUpdate]);

  const deleteCourse = useCallback(async (id) => {
    const result = await executeDelete({
      url: API_ENDPOINTS.COURSE_BY_ID(id),
      method: 'DELETE',
    });
    return result;
  }, [executeDelete]);

  // Lesson Management
  const createLesson = useCallback(async (lessonData) => {
    const result = await executeCreate({
      url: API_ENDPOINTS.LESSON_BY_ID(''),
      method: 'POST',
      body: lessonData,
    });
    return result;
  }, [executeCreate]);

  const updateLesson = useCallback(async (id, lessonData) => {
    const result = await executeUpdate({
      url: API_ENDPOINTS.LESSON_BY_ID(id),
      method: 'PUT',
      body: lessonData,
    });
    return result;
  }, [executeUpdate]);

  const deleteLesson = useCallback(async (id) => {
    const result = await executeDelete({
      url: API_ENDPOINTS.LESSON_BY_ID(id),
      method: 'DELETE',
    });
    return result;
  }, [executeDelete]);

  // Video Management
  const addVideo = useCallback(async (lessonId, videoData) => {
    const result = await executeCreate({
      url: API_ENDPOINTS.VIDEOS_BY_LESSON(lessonId),
      method: 'POST',
      body: videoData,
    });
    return result;
  }, [executeCreate]);

  const deleteVideo = useCallback(async (videoId) => {
    const result = await executeDelete({
      url: API_ENDPOINTS.VIDEO_BY_ID(videoId),
      method: 'DELETE',
    });
    return result;
  }, [executeDelete]);

  return {
    // Data
    users,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Error
    error,
    
    // User actions
    loadUsers,
    updateUserRole,
    
    // Course actions
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Lesson actions
    createLesson,
    updateLesson,
    deleteLesson,
    
    // Video actions
    addVideo,
    deleteVideo,
    
    // Set users (for manual updates)
    setUsers,
  };
};