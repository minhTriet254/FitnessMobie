using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Course;
using Api.Dtos.Video;
using Api.Models;

namespace Api.Mappers
{
    public static class VideoMapper
    {
        public static VideoDto ToVideoDto(this Video video)
        {
            return new VideoDto
            {
                Id = video.Id,
                Url = video.Url,
                Description = video.Description,
                Feedback = video.Feedback,
                Rating = video.Rating
            };
        }

        public static Video ToAddVideo(this AddvideoDto dto, int lessonId)
        {
            return new Video
            {
                Url = dto.Url,
                Description = dto.Description ?? string.Empty,
                Rating = dto.Rating,
                LessonId = lessonId
            };
        }

        public static void UpdateFromDto(this Video video, AddvideoDto dto)
        {
            video.Url = dto.Url;
            video.Description = dto.Description ?? string.Empty;
            video.Rating = dto.Rating;
        }
    }
}