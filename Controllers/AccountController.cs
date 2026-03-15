using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Account;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;  
using Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers
{
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        public AccountController(UserManager<User> userManager,ITokenService tokenService)
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
    
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.UserName,
            user.Email,
            role = roles.FirstOrDefault() ?? "User"
        });
        }
        

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
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