using System.Security.Claims;
using Api.Data;
using Api.Dtos.Chat;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("UserConnected", "Bạn đã kết nối chat thành công");
            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return;

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.Identity?.Name;

            if (string.IsNullOrEmpty(userId))
                throw new HubException("User chưa đăng nhập");

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new HubException("Không tìm thấy user");

            var message = new Message
            {
                SenderId = userId,
                Content = content.Trim(),
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var messageDto = new MessageDto
            {
                Id = message.Id,
                SenderId = userId,
                SenderUserName = user.UserName ?? userName ?? "Unknown",
                Content = message.Content,
                SentAt = message.SentAt
            };

            await Clients.All.SendAsync("ReceiveMessage", messageDto);
        }
    }
}