using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Lesson;
using Api.Models;

namespace Api.Repositories.Interface
{
    public interface ILessonRepostory
    {
        Task<List<Lesson>> GetLessonsAsync();
        Task<Lesson?> GetLessonAsync(int id);
        Task<Lesson> CreateLessonAsync(Lesson addLesson);
        Task<Lesson> UpdateLessonAsync(int id, UpdateLessonDto updateLessonDto);
        Task<Lesson> DeleteLessonAsync(int id);    
        Task<bool> LessonAxistAsync(int id);   
    }
}