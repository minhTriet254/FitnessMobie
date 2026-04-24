using System.Security.Claims;
using Api.Data;
using Api.Dtos.Chat;
using Api.Models;
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

        // ========== GLOBAL CHAT ==========
        [HttpGet("messages")]
        [AllowAnonymous] // Cho phép tất cả users xem
        public async Task<IActionResult> GetGlobalMessages([FromQuery] int take = 50)
        {
            if (take <= 0) take = 50;
            if (take > 200) take = 200;

            var messages = await _context.Messages
                .Where(m => m.ConversationId == null) // Global chat messages
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .Take(take)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderUserName = m.Sender != null ? m.Sender.UserName ?? "Unknown" : "Unknown",
                    Content = m.Content,
                    SentAt = m.SentAt,
                    ConversationId = null,
                    IsReadByAdmin = false,
                    IsGlobalChat = true
                })
                .ToListAsync();

            return Ok(messages);
        }

        // ========== PRIVATE CHAT (PREMIUM) ==========
        [HttpGet("conversation")]
        public async Task<IActionResult> GetMyConversation()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsPremium)
                return StatusCode(403, new { message = "Bạn cần nâng cấp Premium để sử dụng chat hỗ trợ" });

            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    UserId = userId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Conversations.Add(conversation);
                await _context.SaveChangesAsync();
            }

            var conversationDto = await MapToConversationDto(conversation);
            return Ok(conversationDto);
        }

        [HttpGet("messages/private/{conversationId}")]
        public async Task<IActionResult> GetPrivateMessages(int conversationId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

            if (conversation == null)
                return NotFound("Cuộc trò chuyện không tồn tại");

            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .Skip(skip)
                .Take(take)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderUserName = m.Sender != null ? m.Sender.UserName ?? "Unknown" : "Unknown",
                    Content = m.Content,
                    SentAt = m.SentAt,
                    ConversationId = m.ConversationId,
                    IsReadByAdmin = m.IsReadByAdmin,
                    IsGlobalChat = false
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("conversation/{conversationId}/close")]
        public async Task<IActionResult> CloseConversation(int conversationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

            if (conversation == null)
                return NotFound();

            conversation.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã kết thúc cuộc trò chuyện" });
        }

        // ========== ADMIN ENDPOINTS ==========
        [HttpGet("admin/conversations")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllConversations([FromQuery] bool activeOnly = true)
        {
            var query = _context.Conversations
                .Include(c => c.User)
                .Include(c => c.Admin)
                .AsQueryable();

            if (activeOnly)
                query = query.Where(c => c.IsActive);

            var conversations = await query
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();

            var result = new List<ConversationDto>();
            foreach (var conv in conversations)
            {
                result.Add(await MapToConversationDto(conv));
            }

            return Ok(result);
        }

        [HttpGet("admin/messages/{conversationId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetConversationMessages(int conversationId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .Skip(skip)
                .Take(take)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderUserName = m.Sender != null ? m.Sender.UserName ?? "Unknown" : "Unknown",
                    Content = m.Content,
                    SentAt = m.SentAt,
                    ConversationId = m.ConversationId,
                    IsReadByAdmin = m.IsReadByAdmin,
                    IsGlobalChat = false
                })
                .ToListAsync();

            return Ok(messages);
        }

        // Helper method
        private async Task<ConversationDto> MapToConversationDto(Conversation conv)
        {
            var lastMessage = await _context.Messages
                .Where(m => m.ConversationId == conv.Id)
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();

            var unreadCount = await _context.Messages
                .CountAsync(m => m.ConversationId == conv.Id && !m.IsReadByAdmin && m.SenderId != conv.AdminId);

            return new ConversationDto
            {
                Id = conv.Id,
                UserId = conv.UserId,
                UserName = conv.User?.UserName ?? "Unknown",
                AdminId = conv.AdminId,
                AdminName = conv.Admin?.UserName,
                CreatedAt = conv.CreatedAt,
                LastMessageAt = conv.LastMessageAt,
                IsActive = conv.IsActive,
                UnreadCount = unreadCount,
                LastMessage = lastMessage == null ? null : new MessageDto
                {
                    Id = lastMessage.Id,
                    SenderId = lastMessage.SenderId,
                    SenderUserName = lastMessage.Sender?.UserName ?? "Unknown",
                    Content = lastMessage.Content,
                    SentAt = lastMessage.SentAt,
                    ConversationId = lastMessage.ConversationId,
                    IsReadByAdmin = lastMessage.IsReadByAdmin,
                    IsGlobalChat = false
                }
            };
        }
    }
}