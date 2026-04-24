using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class Conversation
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;  // Premium user

        [ForeignKey("UserId")]
        public User User { get; set; }

        public string? AdminId { get; set; }  // Admin đang hỗ trợ (nullable)

        [ForeignKey("AdminId")]
        public User? Admin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastMessageAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}