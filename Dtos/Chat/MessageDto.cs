using System;

namespace Api.Dtos.Chat
{
    public class MessageDto
    {
        public int Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string SenderUserName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public int? ConversationId { get; set; } // NULL = Global Chat
        public bool IsReadByAdmin { get; set; }
        public bool IsGlobalChat { get; set; }
    }
}