using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Course;
using Api.Models;

namespace Api.Repositories.Interface
{
    public interface ICourseRepository
    {
        Task<List<Course>> GetCoursesAsync();
        Task<Course?> GetCourseAsync(int id);
        Task<Course> CreateCourseAsync(Course addCourse);
        Task<Course> UpdateCourseAsync(int id, UpdateCourseDto updateCourseDto);
        Task<Course> DeleteCourseAsync(int id);
        Task<bool> CourseExistAsync(int id);

    }
}