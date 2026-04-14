using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Chat
{
    public class SendMessageDto
    {
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}