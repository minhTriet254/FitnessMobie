using Api.Data;
using Api.Dtos.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages([FromQuery] int take = 50)
        {
            if (take <= 0) take = 50;
            if (take > 200) take = 200;

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .Take(take)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderUserName = m.Sender != null ? m.Sender.UserName ?? "Unknown" : "Unknown",
                    Content = m.Content,
                    SentAt = m.SentAt
                })
                .ToListAsync();

            messages.Reverse();

            return Ok(messages);
        }
    }
}