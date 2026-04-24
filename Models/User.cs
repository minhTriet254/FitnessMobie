using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Api.Models
{
    public class User:IdentityUser
    {
        public string Gender { get; set; }=string.Empty;
        public double Height { get; set; }
        public double Weight { get; set; }
        public DateTime? PremiumExpiryDate { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsPremium => PremiumExpiryDate.HasValue && PremiumExpiryDate > DateTime.UtcNow;
        public int PremiumDaysRemaining => IsPremium ? (int)(PremiumExpiryDate.Value - DateTime.UtcNow).TotalDays : 0;
    }
}