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
        private readonly VnPayService _vnPayService;
        private readonly ILogger<PremiumController> _logger;

        public PremiumController(
            ApplicationDbContext context, 
            VnPayService vnPayService,
            ILogger<PremiumController> logger)
        {
            _context = context;
            _vnPayService = vnPayService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách gói Premium đang hoạt động
        /// </summary>
        /// <returns>Danh sách gói Premium</returns>
        [HttpGet("packages")]
        [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPremiumPackages()
        {
            try
            {
                _logger.LogInformation("Fetching active premium packages");

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

                _logger.LogInformation("Retrieved {Count} premium packages", packages.Count);

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
                    message = "Không thể tải danh sách gói Premium. Vui lòng thử lại sau."
                });
            }
        }

        /// <summary>
        /// Tạo yêu cầu thanh toán nâng cấp Premium
        /// </summary>
        /// <param name="request">Thông tin gói Premium được chọn</param>
        /// <returns>URL thanh toán VNPay</returns>
        [HttpPost("create-payment")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreatePremiumPayment([FromBody] CreatePremiumPaymentRequest request)
        {
            try
            {
                // Validate request
                if (request == null || request.PackageId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Vui lòng chọn gói Premium hợp lệ"
                    });
                }

                // Get current user
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt to create payment");
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Vui lòng đăng nhập để tiếp tục"
                    });
                }

                _logger.LogInformation("User {UserId} requesting payment for package {PackageId}", userId, request.PackageId);

                // Get user info
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found", userId);
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Không tìm thấy thông tin người dùng"
                    });
                }

                // Get package info
                var package = await _context.PremiumConfigs.FindAsync(request.PackageId);
                if (package == null || !package.IsActive)
                {
                    _logger.LogWarning("Package {PackageId} not found or inactive", request.PackageId);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Gói Premium không hợp lệ hoặc đã ngừng kích hoạt"
                    });
                }

                // Check if user already has premium
                if (user.IsPremium)
                {
                    _logger.LogInformation("User {UserId} already has premium until {ExpiryDate}", 
                        userId, user.PremiumExpiryDate);
                    
                    return Ok(new
                    {
                        success = true,
                        isAlreadyPremium = true,
                        message = "Bạn đã là thành viên Premium",
                        expiryDate = user.PremiumExpiryDate,
                        daysRemaining = user.PremiumDaysRemaining
                    });
                }

                // Generate unique order ID
                var orderId = GenerateOrderId(userId);

                // Get client IP address
                var ipAddress = GetClientIpAddress();

                var paymentRequest = new PaymentRequest
                {
                    OrderId = orderId,
                    Amount = package.FinalPrice,
                    OrderInfo = $"Nâng cấp Premium {package.Months} tháng - {user.UserName}",
                    IpAddress = ipAddress
                };

                _logger.LogInformation("Creating VNPay payment for OrderId: {OrderId}, Amount: {Amount}", 
                    orderId, package.FinalPrice);

                // Create payment URL
                var paymentUrl = _vnPayService.CreatePaymentUrl(paymentRequest);
                
                // Store session data
                StorePaymentSession(orderId, userId, package);

                _logger.LogInformation("Payment URL created successfully for OrderId: {OrderId}", orderId);

                return Ok(new
                {
                    success = true,
                    paymentUrl = paymentUrl,
                    orderId = orderId,
                    amount = package.FinalPrice,
                    packageName = package.Name,
                    packageMonths = package.Months
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment for user {UserId}", 
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại sau."
                });
            }
        }

        /// <summary>
        /// Xử lý callback từ VNPay sau khi thanh toán
        /// </summary>
        /// <returns>Redirect về frontend với kết quả thanh toán</returns>
        [HttpGet("vnpay-return")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status302Found)]
        public async Task<IActionResult> VnPayReturn()
        {
            try
            {
                _logger.LogInformation("Received VNPay return callback with {Count} parameters", Request.Query.Count);

                var response = _vnPayService.ValidatePaymentResponse(Request.Query);

                _logger.LogInformation("VNPay validation result: Success={IsSuccess}, ResponseCode={Code}, Message={Message}", 
                    response.IsSuccess, response.ResponseCode, response.Message);

                if (response.IsSuccess && response.TransactionStatus == "success")
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
                _logger.LogError(ex, "Error processing VNPay return");
                return Redirect($"http://localhost:5173/premium-failed?message=Lỗi+xử+lý+thanh+toán");
            }
        }

        /// <summary>
        /// Kiểm tra trạng thái Premium của user hiện tại
        /// </summary>
        /// <returns>Thông tin Premium của user</returns>
        [HttpGet("check-status")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                _logger.LogError(ex, "Error checking premium status for user");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi kiểm tra trạng thái Premium"
                });
            }
        }

        /// <summary>
        /// Kiểm tra quyền truy cập khóa học
        /// </summary>
        /// <param name="courseId">ID của khóa học</param>
        /// <returns>Thông tin quyền truy cập</returns>
        [HttpGet("check-course-access/{courseId}")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

                // Admin luôn có quyền truy cập
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

                // Course có giá = 0 -> free cho tất cả
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

                // Course có giá > 0 -> chỉ Premium mới được xem
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
                _logger.LogError(ex, "Error checking course access for course {CourseId}", courseId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi kiểm tra quyền truy cập"
                });
            }
        }

        #region Private Methods

        private string GenerateOrderId(string userId)
        {
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            var shortUserId = userId.Length > 8 ? userId.Substring(0, 8) : userId;
            
            return $"PREMIUM_{timestamp}_{shortUserId}_{random}";
        }

        private string GetClientIpAddress()
        {
            // Try to get forwarded IP
            var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',').First().Trim();
            }

            // Get remote IP address
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            
            return !string.IsNullOrEmpty(ipAddress) && ipAddress != "::1" 
                ? ipAddress 
                : "127.0.0.1";
        }

        private void StorePaymentSession(string orderId, string userId, PremiumConfig package)
        {
            HttpContext.Session.SetString(orderId, userId);
            HttpContext.Session.SetString($"{orderId}_package", package.Id.ToString());
            HttpContext.Session.SetString($"{orderId}_months", package.Months.ToString());
            HttpContext.Session.SetString($"{orderId}_amount", package.FinalPrice.ToString());
            
            _logger.LogDebug("Stored session data for OrderId: {OrderId}", orderId);
        }

        private async Task<IActionResult> HandleSuccessfulPayment(PaymentResponse response)
        {
            var orderId = response.OrderId;
            var userId = HttpContext.Session.GetString(orderId);
            var monthsStr = HttpContext.Session.GetString($"{orderId}_months");

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(monthsStr))
            {
                _logger.LogWarning("Session expired or not found for OrderId: {OrderId}", orderId);
                return Redirect($"http://localhost:5173/premium-failed?message=Phiên+thanh+toán+hết+hạn");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found for OrderId: {OrderId}", userId, orderId);
                return Redirect($"http://localhost:5173/premium-failed?message=Không+tìm+thấy+người+dùng");
            }

            var months = int.Parse(monthsStr);
            
            // Calculate new expiry date
            var oldExpiryDate = user.PremiumExpiryDate;
            if (user.PremiumExpiryDate == null || user.PremiumExpiryDate < DateTime.UtcNow)
            {
                user.PremiumExpiryDate = DateTime.UtcNow.AddMonths(months);
            }
            else
            {
                user.PremiumExpiryDate = user.PremiumExpiryDate.Value.AddMonths(months);
            }
            
            await _context.SaveChangesAsync();

            // Clear session
            ClearPaymentSession(orderId);

            _logger.LogInformation("User {UserId} upgraded to premium. Old expiry: {OldExpiry}, New expiry: {NewExpiry}", 
                userId, oldExpiryDate, user.PremiumExpiryDate);

            // Log payment success (could save to database)
            LogPaymentSuccess(orderId, userId, response, months);

            return Redirect($"http://localhost:5173/premium-success?" +
                $"amount={response.Amount}&" +
                $"months={months}&" +
                $"expiry={user.PremiumExpiryDate:yyyy-MM-dd}&" +
                $"transactionNo={response.TransactionNo}");
        }

        private IActionResult HandleFailedPayment(PaymentResponse response)
        {
            var orderId = response.OrderId;
            
            // Clear session if exists
            if (!string.IsNullOrEmpty(orderId))
            {
                ClearPaymentSession(orderId);
            }

            var errorMessage = Uri.EscapeDataString(response.Message ?? "Thanh toán thất bại");
            return Redirect($"http://localhost:5173/premium-failed?message={errorMessage}&code={response.ResponseCode}");
        }

        private void ClearPaymentSession(string orderId)
        {
            HttpContext.Session.Remove(orderId);
            HttpContext.Session.Remove($"{orderId}_package");
            HttpContext.Session.Remove($"{orderId}_months");
            HttpContext.Session.Remove($"{orderId}_amount");
        }

        private void LogPaymentSuccess(string orderId, string userId, PaymentResponse response, int months)
        {
            // This could be saved to a Payments table in database
            _logger.LogInformation("""
                Payment Successful:
                OrderId: {OrderId}
                UserId: {UserId}
                Amount: {Amount}
                Months: {Months}
                TransactionNo: {TransactionNo}
                BankCode: {BankCode}
                PayDate: {PayDate}
                """,
                orderId,
                userId,
                response.Amount,
                months,
                response.TransactionNo,
                response.BankCode,
                response.PayDate);
        }

        #endregion
    }

    /// <summary>
    /// Request model for creating premium payment
    /// </summary>
    public class CreatePremiumPaymentRequest
    {
        /// <summary>
        /// ID of the selected premium package
        /// </summary>
        public int PackageId { get; set; }
    }
}