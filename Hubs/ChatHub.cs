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
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = Context.User?.IsInRole("Admin") ?? false;

            if (isAdmin)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                await Clients.Caller.SendAsync("UserConnected", "Admin đã kết nối");
            }
            else if (!string.IsNullOrEmpty(userId))
            {
                // User thường join vào group riêng của họ
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
                
                // Kiểm tra xem user có premium không (chỉ để log)
                var user = await _context.Users.FindAsync(userId);
                var isPremium = user?.IsPremium ?? false;
                
                await Clients.Caller.SendAsync("UserConnected", isPremium ? 
                    "Đã kết nối chat hỗ trợ Premium và Global Chat" : 
                    "Đã kết nối Global Chat");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var isAdmin = Context.User?.IsInRole("Admin") ?? false;
            if (isAdmin)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
            }
            await base.OnDisconnectedAsync(exception);
        }

        // ========== GLOBAL CHAT ==========
        public async Task SendGlobalMessage(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return;

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? Context.User?.Identity?.Name;

            if (string.IsNullOrEmpty(userId))
                throw new HubException("User chưa đăng nhập");

            var message = new Message
            {
                SenderId = userId,
                ConversationId = null, // NULL = Global Chat
                Content = content.Trim(),
                SentAt = DateTime.UtcNow,
                IsReadByAdmin = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var messageDto = new MessageDto
            {
                Id = message.Id,
                SenderId = userId,
                SenderUserName = userName ?? "Unknown",
                Content = message.Content,
                SentAt = message.SentAt,
                ConversationId = null,
                IsReadByAdmin = false,
                IsGlobalChat = true
            };

            // Gửi cho TẤT CẢ users và admins
            await Clients.All.SendAsync("ReceiveGlobalMessage", messageDto);
        }

        // ========== PRIVATE CHAT (PREMIUM) ==========
        public async Task SendPrivateMessage(int conversationId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return;

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? Context.User?.Identity?.Name;
            var isAdmin = Context.User?.IsInRole("Admin") ?? false;

            if (string.IsNullOrEmpty(userId))
                throw new HubException("User chưa đăng nhập");

            // Lấy conversation
            var conversation = await _context.Conversations
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.IsActive);

            if (conversation == null)
                throw new HubException("Cuộc trò chuyện không tồn tại hoặc đã kết thúc");

            // Kiểm tra quyền truy cập
            if (!isAdmin && conversation.UserId != userId)
                throw new HubException("Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này");

            // Kiểm tra user có premium không
            if (!isAdmin)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || !user.IsPremium)
                    throw new HubException("Bạn cần nâng cấp Premium để sử dụng chat hỗ trợ");
            }

            if (isAdmin)
            {
                // Admin claim conversation
                if (string.IsNullOrEmpty(conversation.AdminId))
                {
                    conversation.AdminId = userId;
                }
                else if (conversation.AdminId != userId)
                {
                    throw new HubException("Cuộc trò chuyện đã được admin khác hỗ trợ");
                }
            }

            var message = new Message
            {
                SenderId = userId,
                ConversationId = conversationId,
                Content = content.Trim(),
                SentAt = DateTime.UtcNow,
                IsReadByAdmin = isAdmin
            };

            _context.Messages.Add(message);
            
            conversation.LastMessageAt = message.SentAt;
            
            await _context.SaveChangesAsync();

            var messageDto = new MessageDto
            {
                Id = message.Id,
                SenderId = userId,
                SenderUserName = userName ?? "Unknown",
                Content = message.Content,
                SentAt = message.SentAt,
                ConversationId = conversationId,
                IsReadByAdmin = message.IsReadByAdmin,
                IsGlobalChat = false
            };

            await Clients.Group($"User_{conversation.UserId}")
                .SendAsync("ReceivePrivateMessage", messageDto);

            await Clients.Group("Admins")
                .SendAsync("ReceivePrivateMessage", messageDto);

            await Clients.Caller
                .SendAsync("ReceivePrivateMessage", messageDto);
        }

        public async Task MarkAsRead(int conversationId)
        {
            var isAdmin = Context.User?.IsInRole("Admin") ?? false;
            if (!isAdmin) return;

            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId && !m.IsReadByAdmin)
                .ToListAsync();

            foreach (var msg in messages)
            {
                msg.IsReadByAdmin = true;
            }

            await _context.SaveChangesAsync();
            
            var conversation = await _context.Conversations.FindAsync(conversationId);
            if (conversation != null)
            {
                await Clients.Group($"User_{conversation.UserId}").SendAsync("MessagesRead", conversationId);
            }
        }

        public async Task AdminJoinConversation(int conversationId)
        {
            var isAdmin = Context.User?.IsInRole("Admin") ?? false;
            if (!isAdmin) return;

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var conversation = await _context.Conversations.FindAsync(conversationId);
            if (conversation == null || !conversation.IsActive)
                throw new HubException("Cuộc trò chuyện không tồn tại hoặc đã kết thúc");

            if (!string.IsNullOrEmpty(conversation.AdminId) && conversation.AdminId != userId)
                throw new HubException("Cuộc trò chuyện đã có admin khác hỗ trợ");

            conversation.AdminId = userId;
            await _context.SaveChangesAsync();

            await Clients.Group($"User_{conversation.UserId}").SendAsync("AdminJoined", conversationId, userId);
            await Clients.Group("Admins").SendAsync("ConversationUpdated", conversationId);
        }
    }
}