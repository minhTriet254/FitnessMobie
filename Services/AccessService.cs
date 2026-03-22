using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public interface IAccessService
{
    Task<bool> CanAccessCourse(string userId, int courseId);
    Task<bool> IsPremiumOrAdmin(string userId);
}

public class AccessService : IAccessService
{
    private readonly UserManager<User> _userManager;
    private readonly ApplicationDbContext _context;

    public AccessService(UserManager<User> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<bool> CanAccessCourse(string userId, int courseId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        // Lấy roles - dùng ToUpper() để tránh case sensitive
        var roles = await _userManager.GetRolesAsync(user);
        var isAdmin = roles.Any(r => r.ToUpper() == "ADMIN");
        
        // Admin luôn được access
        if (isAdmin)
        {
            Console.WriteLine($"✅ Admin access granted for user {userId}");
            return true;
        }

        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return false;
        
        // Course free
        if (course.Price == 0)
        {
            Console.WriteLine($"✅ Free course access granted for user {userId}");
            return true;
        }

        // Course premium - check user premium
        var isPremium = user.IsPremium;
        Console.WriteLine($"ℹ️ User {userId} - IsPremium: {isPremium}");
        
        return isPremium;
    }

    public async Task<bool> IsPremiumOrAdmin(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var roles = await _userManager.GetRolesAsync(user);
        var isAdmin = roles.Any(r => r.ToUpper() == "ADMIN");
        
        return isAdmin || user.IsPremium;
    }
}