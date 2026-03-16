using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class PremiumConfig
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, 12)]
        public int Months { get; set; } = 1;

        [Required]
        [Column(TypeName = "decimal(18,0)")]
        public decimal Price { get; set; } = 200000;

        [Column(TypeName = "decimal(18,0)")]
        public decimal? DiscountPrice { get; set; }

        public bool IsActive { get; set; } = true;

        public string Description { get; set; } = string.Empty;

        public decimal FinalPrice => DiscountPrice ?? Price;
    }
}