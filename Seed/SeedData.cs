using Api.Models;
using Microsoft.AspNetCore.Identity;

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
    }
}