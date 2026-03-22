using Api.Data;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PremiumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly MoMoService _momoService;
        private readonly ILogger<PremiumController> _logger;

        public PremiumController(
            ApplicationDbContext context, 
            MoMoService momoService,
            ILogger<PremiumController> logger)
        {
            _context = context;
            _momoService = momoService;
            _logger = logger;
        }

        [HttpPost("manual-upgrade/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ManualUpgrade(string userId, [FromBody] ManualUpgradeRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }
                
                var oldExpiry = user.PremiumExpiryDate;
                if (user.PremiumExpiryDate == null || user.PremiumExpiryDate < DateTime.UtcNow)
                {
                    user.PremiumExpiryDate = DateTime.UtcNow.AddMonths(request.Months);
                }
                else
                {
                    user.PremiumExpiryDate = user.PremiumExpiryDate.Value.AddMonths(request.Months);
                }
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Admin manually upgraded user {UserId}. Old: {OldExpiry}, New: {NewExpiry}", 
                    userId, oldExpiry, user.PremiumExpiryDate);
                
                return Ok(new
                {
                    success = true,
                    message = "User upgraded successfully",
                    userId = userId,
                    newExpiry = user.PremiumExpiryDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in manual upgrade");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        public class ManualUpgradeRequest
        {
            public int Months { get; set; } = 1;
        }

        [HttpGet("callback")]
        [AllowAnonymous]
        public async Task<IActionResult> Callback([FromQuery] Dictionary<string, string> query)
        {
            try
            {
                _logger.LogInformation("=== CALLBACK RECEIVED ===");
                
                // Log tất cả tham số
                foreach (var item in query)
                {
                    _logger.LogInformation("  {Key} = {Value}", item.Key, item.Value);
                }
                
                // Lấy các tham số quan trọng
                var orderId = query.GetValueOrDefault("orderId");
                var resultCode = query.GetValueOrDefault("resultCode");
                var message = query.GetValueOrDefault("message");
                var transId = query.GetValueOrDefault("transId");
                var amount = query.GetValueOrDefault("amount");
                
                _logger.LogInformation("OrderId: {OrderId}, ResultCode: {ResultCode}, TransId: {TransId}", 
                    orderId, resultCode, transId);
                
                if (resultCode == "0")
                {
                    // Thanh toán thành công, cập nhật premium
                    return await HandleSuccessfulCallback(orderId, amount, transId);
                }
                else
                {
                    // Thanh toán thất bại
                    var errorMessage = Uri.EscapeDataString(message ?? "Thanh toán thất bại");
                    return Redirect($"http://localhost:5173/premium-failed?message={errorMessage}&code={resultCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing callback");
                return Redirect($"http://localhost:5173/premium-failed?message=Lỗi+xử+lý+thanh+toán");
            }
        }

        private async Task<IActionResult> HandleSuccessfulCallback(string orderId, string amount, string transId)
{
    _logger.LogInformation("Processing successful callback for OrderId: {OrderId}", orderId);
    
    // Parse orderId: PREMIUM_{userId}_{months}_{timestamp}_{random}
    var parts = orderId.Split('_');
    string userId = "";
    int months = 1;
    
    if (parts.Length >= 3)
    {
        userId = parts[1];
        _logger.LogInformation("Extracted userId: {UserId}", userId);
        
        if (parts.Length >= 4 && int.TryParse(parts[2], out int extractedMonths))
        {
            months = extractedMonths;
            _logger.LogInformation("Extracted months: {Months}", months);
        }
    }
    
    if (string.IsNullOrEmpty(userId))
    {
        _logger.LogWarning("Cannot extract userId from OrderId: {OrderId}", orderId);
        return Redirect($"http://localhost:5173/premium-failed?message=Không+xác+định+được+người+dùng");
    }
    
    var user = await _context.Users.FindAsync(userId);
    if (user == null)
    {
        _logger.LogWarning("User {UserId} not found", userId);
        return Redirect($"http://localhost:5173/premium-failed?message=Không+tìm+thấy+người+dùng");
    }
    
    // Cập nhật premium expiry
    var oldExpiry = user.PremiumExpiryDate;
    if (user.PremiumExpiryDate == null || user.PremiumExpiryDate < DateTime.UtcNow)
    {
        user.PremiumExpiryDate = DateTime.UtcNow.AddMonths(months);
    }
    else
    {
        user.PremiumExpiryDate = user.PremiumExpiryDate.Value.AddMonths(months);
    }
    
    // *** THÊM: LƯU TRANSACTION VÀO DATABASE ***
    var transaction = new Transaction
    {
        TransactionId = transId,
        OrderId = orderId,
        UserId = userId,
        Amount = decimal.Parse(amount),
        Months = months,
        Status = "success",
        CreatedAt = DateTime.UtcNow,
        CompletedAt = DateTime.UtcNow,
        PaymentMethod = "MoMo"
    };
    
    _context.Transactions.Add(transaction);
    
    await _context.SaveChangesAsync();
    
    _logger.LogInformation("✅ User {UserName} upgraded to premium. Old: {OldExpiry}, New: {NewExpiry}", 
        user.UserName, oldExpiry, user.PremiumExpiryDate);
    _logger.LogInformation("✅ Transaction saved: {TransactionId}, Amount: {Amount}", transId, amount);
    
    // Redirect về frontend thành công
    return Redirect($"http://localhost:5173/premium-success?" +
        $"amount={amount}&" +
        $"months={months}&" +
        $"expiry={user.PremiumExpiryDate:yyyy-MM-dd}&" +
        $"transactionNo={transId}");
}

        [HttpGet("packages")]
        public async Task<IActionResult> GetPremiumPackages()
        {
            try
            {
                var packages = await _context.PremiumConfigs
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Price)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Months,
                        OriginalPrice = p.Price,
                        p.DiscountPrice,
                        FinalPrice = p.FinalPrice,
                        p.Description,
                        DiscountPercent = p.DiscountPrice.HasValue 
                            ? Math.Round((1 - p.DiscountPrice.Value / p.Price) * 100, 0)
                            : 0
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = packages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching premium packages");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Không thể tải danh sách gói Premium"
                });
            }
        }

        [HttpGet("payment-methods")]
        [Authorize]
        public IActionResult GetPaymentMethods()
        {
            var methods = new[]
            {
                new { id = "card", name = "Thẻ tín dụng/ghi nợ", icon = "credit_card", description = "Visa, Mastercard, JCB" },
                new { id = "atm", name = "Thẻ ATM nội địa", icon = "atm", description = "Thẻ ATM các ngân hàng Việt Nam" },
                new { id = "wallet", name = "Ví MoMo", icon = "momo", description = "Thanh toán bằng ví MoMo" },
                new { id = "qr", name = "QR Code", icon = "qr_code", description = "Quét mã QR qua ứng dụng MoMo" }
            };
            
            return Ok(new
            {
                success = true,
                data = methods
            });
        }

        [HttpPost("create-payment")]
        [Authorize]
        public async Task<IActionResult> CreatePremiumPayment([FromBody] CreatePremiumPaymentRequest request)
        {
            try
            {
                if (request == null || request.PackageId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Vui lòng chọn gói Premium hợp lệ"
                    });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Vui lòng đăng nhập để tiếp tục"
                    });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                var package = await _context.PremiumConfigs.FindAsync(request.PackageId);
                if (package == null || !package.IsActive)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Gói Premium không hợp lệ"
                    });
                }

                if (user.IsPremium)
                {
                    return Ok(new
                    {
                        success = true,
                        isAlreadyPremium = true,
                        message = "Bạn đã là thành viên Premium",
                        expiryDate = user.PremiumExpiryDate,
                        daysRemaining = user.PremiumDaysRemaining
                    });
                }

                // Tạo orderId với userId và months để dễ parse sau này
                var orderId = GenerateOrderId(user.Id, package.Months);
                var amount = (long)package.FinalPrice;

                var momoRequest = new MoMoPaymentRequest
                {
                    OrderId = orderId,
                    Amount = amount,
                    OrderInfo = $"Nâng cấp Premium {package.Months} tháng - {user.UserName}"
                };

                var momoResponse = await _momoService.CreateCardPaymentAsync(momoRequest);

                if (momoResponse.resultCode == 0)
                {
                    StorePaymentSession(orderId, user.Id, package);
                    
                    _logger.LogInformation("Payment created - OrderId: {OrderId}, UserId: {UserId}, Months: {Months}", 
                        orderId, user.Id, package.Months);
                    
                    return Ok(new
                    {
                        success = true,
                        payUrl = momoResponse.payUrl,
                        orderId = orderId,
                        amount = package.FinalPrice,
                        packageName = package.Name,
                        packageMonths = package.Months
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = momoResponse.message,
                        resultCode = momoResponse.resultCode
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi tạo thanh toán"
                });
            }
        }

        [HttpGet("momo-return")]
        [AllowAnonymous]
        public async Task<IActionResult> MoMoReturn()
        {
            try
            {
                _logger.LogInformation("=== MoMo Return Callback Received ===");
                
                // Log tất cả query parameters
                foreach (var key in Request.Query.Keys)
                {
                    _logger.LogInformation("Query param: {Key} = {Value}", key, Request.Query[key]);
                }
                
                var response = _momoService.ValidateReturnResponse(Request.Query);
                
                _logger.LogInformation("Validation: ResultCode={ResultCode}, OrderId={OrderId}, TransId={TransId}", 
                    response.resultCode, response.orderId, response.transId);
                
                if (response.resultCode == 0)
                {
                    return await HandleSuccessfulPayment(response);
                }
                else
                {
                    return HandleFailedPayment(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing MoMo return: {Message}", ex.Message);
                return Redirect($"http://localhost:5173/premium-failed?message=Lỗi+xử+lý+thanh+toán");
            }
        }

        [HttpPost("momo-ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> MoMoIpn()
        {
            try
            {
                _logger.LogInformation("=== MoMo IPN Callback Received ===");
                
                var response = _momoService.ValidateIpnResponse(Request.Query);

                if (response.resultCode == 0)
                {
                    await ProcessSuccessfulPayment(response);
                    return Ok(new { resultCode = 0, message = "Success" });
                }
                else
                {
                    return Ok(new { resultCode = -1, message = "Failed" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing MoMo IPN: {Message}", ex.Message);
                return Ok(new { resultCode = -1, message = ex.Message });
            }
        }

        [HttpGet("check-status")]
        [Authorize]
        public async Task<IActionResult> CheckPremiumStatus()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Vui lòng đăng nhập"
                    });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                return Ok(new
                {
                    success = true,
                    isPremium = user.IsPremium,
                    expiryDate = user.PremiumExpiryDate,
                    daysRemaining = user.PremiumDaysRemaining,
                    userName = user.UserName,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking premium status");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi kiểm tra trạng thái Premium"
                });
            }
        }

        [HttpGet("admin/revenue")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRevenue([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var query = _context.Transactions.AsQueryable();
                
                if (startDate.HasValue)
                    query = query.Where(t => t.CreatedAt >= startDate.Value);
                if (endDate.HasValue)
                    query = query.Where(t => t.CreatedAt <= endDate.Value.AddDays(1));
                
                var transactions = await query
                    .Where(t => t.Status == "success")
                    .OrderByDescending(t => t.CreatedAt)
                    .Include(t => t.User)
                    .ToListAsync();
                
                var totalRevenue = transactions.Sum(t => t.Amount);
                var totalTransactions = transactions.Count;
                var averageAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
                
                var transactionData = transactions.Select(t => new
                {
                    id = t.Id,
                    transactionId = t.TransactionId,
                    userName = t.User.UserName,
                    amount = t.Amount,
                    months = t.Months,
                    createdAt = t.CreatedAt,
                    status = t.Status
                });
                
                return Ok(new
                {
                    success = true,
                    totalRevenue = totalRevenue,
                    totalTransactions = totalTransactions,
                    averageAmount = averageAmount,
                    transactions = transactionData
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue data");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Không thể tải dữ liệu doanh thu"
                });
            }
        }



        [HttpGet("check-course-access/{courseId}")]
        [Authorize]
        public async Task<IActionResult> CheckCourseAccess(int courseId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Vui lòng đăng nhập"
                    });
                }

                var user = await _context.Users.FindAsync(userId);
                var course = await _context.Courses.FindAsync(courseId);

                if (course == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy khóa học"
                    });
                }

                if (User.IsInRole("Admin"))
                {
                    return Ok(new
                    {
                        success = true,
                        hasAccess = true,
                        role = "Admin",
                        message = "Admin có quyền truy cập tất cả khóa học"
                    });
                }

                if (course.Price == 0)
                {
                    return Ok(new
                    {
                        success = true,
                        hasAccess = true,
                        isFree = true,
                        message = "Khóa học miễn phí"
                    });
                }

                if (user?.IsPremium == true)
                {
                    return Ok(new
                    {
                        success = true,
                        hasAccess = true,
                        isFree = false,
                        isPremium = true,
                        expiryDate = user.PremiumExpiryDate,
                        daysRemaining = user.PremiumDaysRemaining,
                        message = "Khóa học Premium"
                    });
                }

                return Ok(new
                {
                    success = true,
                    hasAccess = false,
                    isFree = false,
                    isPremium = false,
                    message = "Bạn cần nâng cấp Premium để xem khóa học này",
                    price = course.Price
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking course access");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi kiểm tra quyền truy cập"
                });
            }
        }

        #region Private Methods

        private string GenerateOrderId(string userId, int months)
        {
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(10000, 99999);
            // Format: PREMIUM_{userId}_{months}_{timestamp}_{random}
            // Dễ dàng parse để lấy userId và months
            return $"PREMIUM_{userId}_{months}_{timestamp}_{random}";
        }

        private void StorePaymentSession(string orderId, string userId, PremiumConfig package)
        {
            HttpContext.Session.SetString(orderId, userId);
            HttpContext.Session.SetString($"{orderId}_package", package.Id.ToString());
            HttpContext.Session.SetString($"{orderId}_months", package.Months.ToString());
            HttpContext.Session.SetString($"{orderId}_amount", package.FinalPrice.ToString());
            
            _logger.LogInformation("Session stored - OrderId: {OrderId}, UserId: {UserId}, Months: {Months}", 
                orderId, userId, package.Months);
        }

        private async Task<IActionResult> HandleSuccessfulPayment(MoMoPaymentResponse response)
            {
                var orderId = response.orderId;
                _logger.LogInformation("Processing successful payment for OrderId: {OrderId}", orderId);
                
                // CÁCH 1: Lấy từ Session
                var userId = HttpContext.Session.GetString(orderId);
                var monthsStr = HttpContext.Session.GetString($"{orderId}_months");
                
                _logger.LogInformation("Session data - UserId: {UserId}, Months: {Months}", userId, monthsStr);
                
                // CÁCH 2: Nếu session không có, parse từ OrderId
                if (string.IsNullOrEmpty(userId))
                {
                    var parts = orderId.Split('_');
                    _logger.LogInformation("Parsing OrderId: {OrderId}, Parts count: {Count}", orderId, parts.Length);
                    
                    if (parts.Length >= 3)
                    {
                        userId = parts[1];
                        _logger.LogInformation("Extracted userId from OrderId: {UserId}", userId);
                        
                        if (parts.Length >= 4)
                        {
                            if (int.TryParse(parts[2], out int extractedMonths))
                            {
                                monthsStr = extractedMonths.ToString();
                                _logger.LogInformation("Extracted months from OrderId: {Months}", extractedMonths);
                            }
                        }
                    }
                }
                
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("Cannot find userId for OrderId: {OrderId}", orderId);
                    return Redirect($"http://localhost:5173/premium-failed?message=Không+xác+định+được+người+dùng");
                }
                
                int months = 1;
                if (!string.IsNullOrEmpty(monthsStr) && int.TryParse(monthsStr, out int parsedMonthsValue))
                {
                    months = parsedMonthsValue;
                }
                
                _logger.LogInformation("Final months value: {Months}", months);
                
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found", userId);
                    return Redirect($"http://localhost:5173/premium-failed?message=Không+tìm+thấy+người+dùng");
                }
                
                _logger.LogInformation("Found user: {UserName}, Current PremiumExpiry: {Expiry}", 
                    user.UserName, user.PremiumExpiryDate);
                
                // Cập nhật premium expiry
                var oldExpiry = user.PremiumExpiryDate;
                if (user.PremiumExpiryDate == null || user.PremiumExpiryDate < DateTime.UtcNow)
                {
                    user.PremiumExpiryDate = DateTime.UtcNow.AddMonths(months);
                }
                else
                {
                    user.PremiumExpiryDate = user.PremiumExpiryDate.Value.AddMonths(months);
                }
                
                // *** THÊM: LƯU TRANSACTION VÀO DATABASE ***
                var transaction = new Transaction
                {
                    TransactionId = response.transId,
                    OrderId = orderId,
                    UserId = userId,
                    Amount = response.amount,
                    Months = months,
                    Status = "success",
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow,
                    PaymentMethod = "MoMo"
                };
                
                _context.Transactions.Add(transaction);
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("User {UserName} upgraded to premium. Old: {OldExpiry}, New: {NewExpiry}", 
                    user.UserName, oldExpiry, user.PremiumExpiryDate);
                _logger.LogInformation("✅ Transaction saved: {TransactionId}, Amount: {Amount}", response.transId, response.amount);
                
                // Xóa session
                ClearPaymentSession(orderId);
                
                // Redirect về frontend
                var redirectUrl = $"http://localhost:5173/premium-success?" +
                    $"amount={response.amount}&" +
                    $"months={months}&" +
                    $"expiry={user.PremiumExpiryDate:yyyy-MM-dd}&" +
                    $"transactionNo={response.transId}";
                
                _logger.LogInformation("Redirecting to: {RedirectUrl}", redirectUrl);
                
                return Redirect(redirectUrl);
            }

        private async Task ProcessSuccessfulPayment(MoMoPaymentResponse response)
        {
            var orderId = response.orderId;
            _logger.LogInformation("Processing IPN for OrderId: {OrderId}", orderId);
            
            // Lấy userId từ session
            var userId = HttpContext.Session.GetString(orderId);
            
            // Nếu session không có, parse từ orderId
            if (string.IsNullOrEmpty(userId))
            {
                var parts = orderId.Split('_');
                if (parts.Length >= 3)
                {
                    userId = parts[1]; // Lấy userId từ phần tử thứ 2
                    _logger.LogInformation("Extracted userId from OrderId for IPN: {UserId}", userId);
                }
            }
            
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Cannot find userId for OrderId: {OrderId}", orderId);
                return;
            }

            var monthsStr = HttpContext.Session.GetString($"{orderId}_months");
            
            int months = 1;
            if (!string.IsNullOrEmpty(monthsStr))
            {
                int.TryParse(monthsStr, out months);
            }
            else
            {
                // Parse từ orderId
                var parts = orderId.Split('_');
                if (parts.Length >= 4 && int.TryParse(parts[2], out int extractedMonths))
                {
                    months = extractedMonths;
                }
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found for IPN", userId);
                return;
            }

            if (user.PremiumExpiryDate == null || user.PremiumExpiryDate < DateTime.UtcNow)
            {
                user.PremiumExpiryDate = DateTime.UtcNow.AddMonths(months);
            }
            else
            {
                user.PremiumExpiryDate = user.PremiumExpiryDate.Value.AddMonths(months);
            }
            
            await _context.SaveChangesAsync();
            ClearPaymentSession(orderId);

            _logger.LogInformation("IPN - User {UserId} upgraded to premium. New expiry: {NewExpiry}", 
                userId, user.PremiumExpiryDate);
        }

        private IActionResult HandleFailedPayment(MoMoPaymentResponse response)
        {
            var orderId = response.orderId;
            
            if (!string.IsNullOrEmpty(orderId))
            {
                ClearPaymentSession(orderId);
            }

            var errorMessage = Uri.EscapeDataString(response.message ?? "Thanh toán thất bại");
            return Redirect($"http://localhost:5173/premium-failed?message={errorMessage}&code={response.resultCode}");
        }

        private void ClearPaymentSession(string orderId)
        {
            HttpContext.Session.Remove(orderId);
            HttpContext.Session.Remove($"{orderId}_package");
            HttpContext.Session.Remove($"{orderId}_months");
            HttpContext.Session.Remove($"{orderId}_amount");
        }

        #endregion
    }

        public class CreatePremiumPaymentRequest
    {
        public int PackageId { get; set; }
        public string? PaymentMethod { get; set; } 
        public string? CardNumber { get; set; }
        public string? CardHolder { get; set; }
        public string? CardExpire { get; set; }
        public string? CardCVV { get; set; }
    }


    public static class DictionaryExtensions
{
    public static string GetValueOrDefault(this Dictionary<string, string> dict, string key, string defaultValue = "")
    {
        return dict.TryGetValue(key, out var value) ? value : defaultValue;
    }
}

}