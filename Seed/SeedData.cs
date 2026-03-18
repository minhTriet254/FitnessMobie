using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Seed
{
    public static class SeedData
    {
        public static async Task SeedAdminAsync(
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Create roles
            if (!await roleManager.RoleExistsAsync("Admin"))
                await roleManager.CreateAsync(new IdentityRole("Admin"));

            if (!await roleManager.RoleExistsAsync("User"))
                await roleManager.CreateAsync(new IdentityRole("User"));

            // Create Admin
            var admin = await userManager.FindByNameAsync("admin11");

            if (admin == null)
            {
                var newAdmin = new User
                {
                    UserName = "admin11",
                    Email = "admin@gmail.com"
                };

                await userManager.CreateAsync(newAdmin, "minhTriet2504");
                await userManager.AddToRoleAsync(newAdmin, "Admin");
            }
        }

        public static async Task SeedPremiumPackagesAsync(ApplicationDbContext context)
        {
            if (!await context.PremiumConfigs.AnyAsync())
            {
                var packages = new List<PremiumConfig>
                {
                    new PremiumConfig 
                    { 
                        Name = "Premium 1 tháng", 
                        Months = 1, 
                        Price = 200000,
                        Description = "Sử dụng Premium trong 1 tháng",
                        IsActive = true 
                    },
                    new PremiumConfig 
                    { 
                        Name = "Premium 3 tháng", 
                        Months = 3, 
                        Price = 500000,
                        DiscountPrice = 450000,
                        Description = "Tiết kiệm 10% khi mua 3 tháng",
                        IsActive = true 
                    },
                    new PremiumConfig 
                    { 
                        Name = "Premium 6 tháng", 
                        Months = 6, 
                        Price = 900000,
                        DiscountPrice = 800000,
                        Description = "Tiết kiệm 11% khi mua 6 tháng",
                        IsActive = true 
                    },
                };
                
                await context.PremiumConfigs.AddRangeAsync(packages);
                await context.SaveChangesAsync();
            }
        }
    }
}