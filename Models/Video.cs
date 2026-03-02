using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Models
{
    public class Video
    {
        
        public int Id { get; set; }
        public string Url { get; set; }=string.Empty;
        public string Description { get; set; } =string.Empty;
        public string Feedback { get; set; }=string.Empty;
        public int? Rating { get; set; }

        public int LessonId { get; set; }
        public Lesson Lesson { get; set; }=null!;
    }
}