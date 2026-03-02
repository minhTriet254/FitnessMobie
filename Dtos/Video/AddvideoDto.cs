using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Video
{
public class AddvideoDto
{
    [Required]
    [Url]
    public string Url { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Range(1,5)]
    public int? Rating { get; set; }
}
}