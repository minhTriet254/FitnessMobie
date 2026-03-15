import api from "./api";

const courseService = {
  getAllCourses: async () => {
    const response = await api.get("/api/CourseController/courses");
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/api/CourseController/course/${id}`);
    return response.data;
  },

  getLessonById: async (id) => {
    const response = await api.get(`/api/LessonController/${id}`);
    return response.data;
  },
};

export default courseService;