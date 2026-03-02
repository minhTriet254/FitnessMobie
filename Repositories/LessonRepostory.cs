using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Lesson;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class LessonRepostory : ILessonRepostory
    {
        private readonly ApplicationDbContext _dbContext;
        public LessonRepostory (ApplicationDbContext context)
        {
            _dbContext=context;
        }
        public async Task<Lesson> CreateLessonAsync(Lesson addLesson)
        {
            await _dbContext.Lessons.AddAsync(addLesson);
            await _dbContext.SaveChangesAsync();
            return addLesson;
        }

        public async Task<Lesson> DeleteLessonAsync(int id)
        {
            var lesson=await _dbContext.Lessons.FindAsync(id);
            if(lesson==null)
            {
                throw new KeyNotFoundException($"Lesson with id {id} not found.");
            }
            _dbContext.Lessons.Remove(lesson);
            await _dbContext.SaveChangesAsync();
            return lesson;
        }

        public async Task<Lesson?> GetLessonAsync(int id)
        {
            return await _dbContext.Lessons.Include(v=>v.Videos).FirstOrDefaultAsync(i=>i.Id==id);
        }

        public async Task<List<Lesson>> GetLessonsAsync()
        {
            return await _dbContext.Lessons.ToListAsync();
        }

        public Task<bool> LessonAxistAsync(int id)
        {
            return _dbContext.Lessons.AnyAsync(i=>i.Id==id);
        }

        public async Task<Lesson> UpdateLessonAsync(int id, UpdateLessonDto updateLessonDto )
        {
            var EditLesson = await _dbContext.Lessons.FindAsync(id);
            if (EditLesson==null)
            {
                throw new KeyNotFoundException($"Lesson with id {id} not found.");
            }
            EditLesson.Title = updateLessonDto.Title;
            EditLesson.Content = updateLessonDto.Content;
   
            await _dbContext.SaveChangesAsync();
            return EditLesson;
        }


    }
}