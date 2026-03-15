import api from "./api";

const adminService = {
  // Courses
  createCourse: async (courseData) => {
    const response = await api.post("/api/CourseController/courses", courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/api/CourseController/course/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/api/CourseController/course/${id}`);
    return response.data;
  },

  // Lessons
  createLesson: async (lessonData) => {
    const response = await api.post("/api/LessonController", lessonData);
    return response.data;
  },

  updateLesson: async (id, lessonData) => {
    const response = await api.put(`/api/LessonController/${id}`, lessonData);
    return response.data;
  },

  deleteLesson: async (id) => {
    const response = await api.delete(`/api/LessonController/${id}`);
    return response.data;
  },

  // Videos
  addVideo: async (lessonId, videoData) => {
    const response = await api.post(`/api/VideoController/lesson/${lessonId}/videos`, videoData);
    return response.data;
  },

  deleteVideo: async (videoId) => {
    const response = await api.delete(`/api/VideoController/${videoId}`);
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await api.get("/api/admin/users");
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

export default adminService;