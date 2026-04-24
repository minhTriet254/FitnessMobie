using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Account
{
    public class BodyMetricsDto
    {
        [Required]
        public double Height { get; set; }
        
        [Required]
        public double Weight { get; set; }
    }
}