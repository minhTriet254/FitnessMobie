using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Video;
namespace Api.Dtos.Lesson
{
    public class LessonDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public List<VideoDto> Videos { get; set; }= new();
}

}