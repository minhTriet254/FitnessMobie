using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Account;
using Api.Models;
using Api.Repositories.Interface;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;

        public AccountController(UserManager<User> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = new User
            {
                UserName = dto.UserName,
                Email = dto.Email
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                role = roles.FirstOrDefault() ?? "User",
                token = _tokenService.CreateToken(user, roles)
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UserName);

            if (user == null)
                return Unauthorized("Invalid username");

            var valid = await _userManager.CheckPasswordAsync(user, dto.Password);

            if (!valid)
                return Unauthorized("Invalid password");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                role = roles.FirstOrDefault() ?? "User",
                token = _tokenService.CreateToken(user, roles)
            });
        }

        [Authorize]
        [HttpPost("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized("User not found");

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound("User does not exist");
                
            user.Gender = dto.Gender;
            user.Height = dto.Height;
            user.Weight = dto.Weight;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                message = "Profile updated successfully",
                user = new
                {
                    user.UserName,
                    user.Email,
                    user.Gender,
                    user.Height,
                    user.Weight
                }
            });
        }

        [Authorize]
        [HttpPut("body-metrics")]
        public async Task<IActionResult> UpdateBodyMetrics([FromBody] BodyMetricsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found");

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound("User does not exist");

            user.Height = dto.Height;
            user.Weight = dto.Weight;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                message = "Profile updated successfully"
            });
        }

        [Authorize]
        [HttpGet("getprofile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found");

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound("User does not exist");

            return Ok(new
            {
                user.UserName,
                user.Email,
                user.Gender,
                user.Height,
                user.Weight,
                user.IsPremium,
                user.PremiumDaysRemaining,
                memberSince = user.CreatedAt
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();

            var usersDto = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                usersDto.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    role = roles.FirstOrDefault() ?? "User"
                });
            }

            return Ok(usersDto);
        }
    }
}