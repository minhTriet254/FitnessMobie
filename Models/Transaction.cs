using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
        public decimal Amount { get; set; }
        public int Months { get; set; }
        public string Status { get; set; } = "pending"; // pending, success, failed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string? PaymentMethod { get; set; } = "MoMo";
    }
}