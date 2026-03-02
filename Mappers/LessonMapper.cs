using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Course;
using Api.Dtos.Lesson;
using Api.Models;

namespace Api.Mappers
{
    public static class LessonMapper
    {
        public static LessonDto ToLessonDto(this Lesson lesson)
        {
            return new LessonDto
            {
                Id=lesson.Id,
                Title=lesson.Title,
                Content=lesson.Content,


            };
        }
        public static LessonDetailDto ToLessonDetailDto(this Lesson lesson)
        {
            return new LessonDetailDto
            {
                Id=lesson.Id,
                Title=lesson.Title,
                Content=lesson.Content,

                Videos=lesson.Videos.Select(v=>v.ToVideoDto()).ToList()
            };
        }

        public static Lesson ToAddLesson(this AddLesson addLesson,int courseId)
        {
            return new Lesson
            {
                Title=addLesson.Title,
                Content=addLesson.Content,
                CourseId=courseId
            };
        }
        public static Lesson ToUpdateLesson(this UpdateLessonDto updateLessonDto)
        {
            return new Lesson
            {
                Title=updateLessonDto.Title,
                Content=updateLessonDto.Content                
            };
        }
    }
}