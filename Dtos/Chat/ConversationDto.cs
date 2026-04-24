namespace Api.Dtos.Chat
{
    public class ConversationDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? AdminId { get; set; }
        public string? AdminName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public bool IsActive { get; set; }
        public MessageDto? LastMessage { get; set; }
        public int UnreadCount { get; set; }
    }
}