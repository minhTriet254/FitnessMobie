using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Chat
{
    public class SendGlobalMessageDto
    {
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
    
    public class SendPrivateMessageDto
    {
        [Required]
        public int ConversationId { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}