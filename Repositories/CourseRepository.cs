using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Course;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class CourseRepository: ICourseRepository
    {
        private readonly ApplicationDbContext _dbContext;

		public CourseRepository(ApplicationDbContext dbContext)
		{
			_dbContext = dbContext;
		}

        public async Task<List<Course>> GetCoursesAsync()
        {
            return await _dbContext.Courses.Include(c => c.Lessons).ToListAsync();
        }
        
        public async Task<Course?> GetCourseAsync(int id)
        {
        return await _dbContext.Courses
        .Include(c => c.Lessons)
            .ThenInclude(l => l.Videos)
        .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Course> CreateCourseAsync(Course addCourse)
        {
           await _dbContext.Courses.AddAsync(addCourse);
           await _dbContext.SaveChangesAsync();
           return addCourse;

        }
        public async Task<Course> UpdateCourseAsync(int id, UpdateCourseDto updateCourseDto)
        {
            var EditCourse = await _dbContext.Courses.FindAsync(id);
            if (EditCourse==null)
            {
                throw new KeyNotFoundException($"Course with id {id} not found.");
            }
            EditCourse.Name = updateCourseDto.Name;
            EditCourse.Description = updateCourseDto.Description;

            EditCourse.Price = updateCourseDto.Price;
            await _dbContext.SaveChangesAsync();
            return EditCourse;
        }

        public async Task<Course> DeleteCourseAsync(int id)
        {
            var Course=await _dbContext.Courses.FindAsync(id);
            if (Course==null)
            {
                throw new KeyNotFoundException($"Course with id {id} not found.");
            }
            _dbContext.Courses.Remove(Course);
            await _dbContext.SaveChangesAsync();
            return Course;
        }

        public Task<bool> CourseExistAsync(int id)
        {
            return _dbContext.Courses.AnyAsync(i=>i.Id==id);
        }
    }
}