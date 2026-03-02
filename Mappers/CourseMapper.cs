using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Course;
using Api.Models;

namespace Api.Mappers
{
    public static class CourseMapper
    {
        public static CourseDto ToCourseDto(this Course course)
        {
            return new CourseDto
            {
                Id = course.Id,
                Name = course.Name,
                Price = course.Price
            };
        }

        public static Course ToAddCourse(this AddCourseDto dto)
        {
            return new Course
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate, 
                Price = dto.Price
            };
        }

 
        public static void UpdateFromDto(this Course course, UpdateCourseDto dto)
        {
            course.Name = dto.Name;
            course.Description = dto.Description;
            course.Price = dto.Price;
        }

        public static CourseDetailDto ToCourseDetailDto(this Course course)
        {
            return new CourseDetailDto
            {
                Id = course.Id,
                Name = course.Name,
                Description = course.Description,
                StartDate = course.StartDate,
                EndDate = course.EndDate,
                Price = course.Price,
                Lessons = course.Lessons
                    .Select(l => l.ToLessonDto())
                    .ToList()
            };
        }
    }
}