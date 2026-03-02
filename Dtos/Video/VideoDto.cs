using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Dtos.Video
{
    public class VideoDto
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public int? Rating { get; set; }

    }

}