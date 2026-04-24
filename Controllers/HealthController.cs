using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;
using System.Text.Json;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HealthController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly UserManager<User> _userManager;

        public HealthController(IGeminiService geminiService, UserManager<User> userManager)
        {
            _geminiService = geminiService;
            _userManager = userManager;
        }

        [HttpGet("bmi-analysis")]
        public async Task<IActionResult> GetBmiAnalysis()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) 
                return Unauthorized();

            if (string.IsNullOrEmpty(user.Gender))
                return BadRequest(new { message = "Vui lòng cập nhật giới tính trong profile" });
            
            if (user.Height <= 0 || user.Weight <= 0)
                return BadRequest(new { message = "Vui lòng cập nhật chiều cao và cân nặng" });

            var resultJson = await _geminiService.GetBmiAnalysis(user.Height, user.Weight, user.Gender);
            
            var resultObject = JsonSerializer.Deserialize<object>(resultJson);
            
            return Ok(resultObject);
        }
    }
}