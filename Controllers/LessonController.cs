using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Lesson;
using Api.Mappers;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace Api.Controllers
{    
    [Authorize]
    [Route("api/LessonController")]
    [ApiController]
    public class LessonController : ControllerBase    
    {
         private readonly ILessonRepostory _lessonRepo;
         private readonly ICourseRepository _courseRepo;

		public LessonController(ILessonRepostory lesson,ICourseRepository course)
		{
			_lessonRepo = lesson;
            _courseRepo=course;
		}

        [HttpGet("Lesson")]
        public async Task<IActionResult> GetLessons()
        {
            var Lessons = await _lessonRepo.GetLessonsAsync();
            var LessonDto= Lessons.Select(l=>l.ToLessonDto());
            return Ok(LessonDto);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLesson (int id)
        {
            var lesson= await _lessonRepo.GetLessonAsync(id);
                if (lesson==null)   
                {
                    return NotFound();
                }
            return Ok(lesson.ToLessonDetailDto());
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("CourseId")]
        public async Task<IActionResult> CreateLesson(int CourseId,AddLesson lessonDto)
        {
            if (!await _courseRepo.CourseExistAsync(CourseId))
            {
                return BadRequest("Course does not exist");
            }   
            var lesson   =  lessonDto.ToAddLesson(CourseId);
            await _lessonRepo.CreateLessonAsync(lesson);
            return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, lesson.ToLessonDto());
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLesson(int id, UpdateLessonDto updateLessonDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var Lesson = await _lessonRepo.UpdateLessonAsync(id, updateLessonDto);
            if (Lesson == null)
            {
                return NotFound();
            }
            return Ok(Lesson.ToLessonDto());

        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
            {
                var course = await _lessonRepo.DeleteLessonAsync(id);
                if (course == null)
                {
                    return NotFound();
                }

              return NoContent();
            }
        

    }
}