using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class Message
    {
        public int Id { get; set; }

        [Required]
        public string SenderId { get; set; } = string.Empty;

        [ForeignKey("SenderId")]
        public User Sender { get; set; }

        // NULL = Global Chat, Có giá trị = Private Chat
        public int? ConversationId { get; set; }

        [ForeignKey("ConversationId")]
        public Conversation? Conversation { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        // Chỉ dùng cho Private Chat
        public bool IsReadByAdmin { get; set; } = false;
        
        // Đánh dấu loại chat
        public bool IsGlobalChat => ConversationId == null;
    }
}