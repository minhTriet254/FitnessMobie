import axios from './axios';

export const courseApi = {
  getAllCourses: async () => {
    return await axios.get('/CourseController/courses');
  },

  getCourseById: async (id: number) => {
    return await axios.get(`/CourseController/courses/${id}`);
  },

  getLessonsByCourseId: async (courseId: number) => {
    return await axios.get(`/CourseController/courses/${courseId}/lessons`);
  }
};