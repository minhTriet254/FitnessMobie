using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Api.Services
{
    public class MoMoService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MoMoService> _logger;
        private readonly HttpClient _httpClient;
        
        private readonly string _partnerCode;
        private readonly string _accessKey;
        private readonly string _secretKey;
        private readonly string _endpoint;
        private readonly string _returnUrl;
        private readonly string _notifyUrl;

        public MoMoService(IConfiguration configuration, ILogger<MoMoService> logger, HttpClient httpClient)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClient;
            
            _partnerCode = _configuration["MoMo:PartnerCode"] ?? "MOMO";
            _accessKey = _configuration["MoMo:AccessKey"] ?? "F8BBA842ECF85";
            _secretKey = _configuration["MoMo:SecretKey"] ?? "K951B6PE1waDMi640xX08PD3vg6EkVlz";
            _endpoint = _configuration["MoMo:Endpoint"] ?? "https://test-payment.momo.vn/v2/gateway/api/create";
            _returnUrl = _configuration["MoMo:ReturnUrl"] ?? "http://localhost:5086/api/Premium/momo-return";
            _notifyUrl = _configuration["MoMo:NotifyUrl"] ?? "http://localhost:5086/api/Premium/momo-ipn";
            
            _logger.LogInformation("MoMo initialized - PartnerCode: {PartnerCode}", _partnerCode);
        }

        public async Task<MoMoPaymentResponse> CreateCardPaymentAsync(MoMoPaymentRequest request)
        {
            try
            {
                var orderId = request.OrderId;
                var requestId = Guid.NewGuid().ToString();
                var amount = request.Amount.ToString();
                var orderInfo = request.OrderInfo;
                var requestType = "captureWallet"; // Sửa thành captureWallet
                var extraData = "";
                
                // Tạo raw signature theo đúng thứ tự alphabet
                var rawSignature = $"accessKey={_accessKey}&amount={amount}&extraData={extraData}&ipnUrl={_notifyUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={_partnerCode}&redirectUrl={_returnUrl}&requestId={requestId}&requestType={requestType}";
                
                _logger.LogInformation("Raw signature: {RawSignature}", rawSignature);
                
                var signature = HmacSha256(_secretKey, rawSignature);
                _logger.LogInformation("Signature: {Signature}", signature);

                // Tạo request body
                var paymentRequest = new
                {
                    partnerCode = _partnerCode,
                    partnerName = "Test",
                    storeId = "TestStore",
                    requestId = requestId,
                    amount = amount,
                    orderId = orderId,
                    orderInfo = orderInfo,
                    redirectUrl = _returnUrl,
                    ipnUrl = _notifyUrl,
                    lang = "vi",
                    extraData = extraData,
                    requestType = requestType,
                    signature = signature
                };

                var jsonRequest = JsonConvert.SerializeObject(paymentRequest);
                _logger.LogInformation("MoMo request: {JsonRequest}", jsonRequest);

                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(_endpoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation("MoMo response: {ResponseContent}", responseContent);

                var result = JsonConvert.DeserializeObject<MoMoPaymentResponse>(responseContent);
                
                if (result != null && result.resultCode == 0)
                {
                    _logger.LogInformation("MoMo payment created successfully. PayUrl: {PayUrl}", result.payUrl);
                }
                else
                {
                    _logger.LogWarning("MoMo payment creation failed. ResultCode: {ResultCode}, Message: {Message}", 
                        result?.resultCode, result?.message);
                }

                return result ?? new MoMoPaymentResponse { resultCode = -1, message = "No response from MoMo" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating MoMo card payment");
                return new MoMoPaymentResponse { resultCode = -1, message = ex.Message };
            }
        }

        public MoMoPaymentResponse ValidateReturnResponse(IQueryCollection query)
        {
            try
            {
                var response = new MoMoPaymentResponse();
                
                if (query == null || query.Count == 0)
                {
                    response.resultCode = -1;
                    response.message = "No response data";
                    return response;
                }
                
                // Log tất cả parameters
                _logger.LogInformation("=== MoMo Return Parameters ===");
                foreach (var key in query.Keys)
                {
                    _logger.LogInformation("{Key} = {Value}", key, query[key]);
                }
                
                var orderId = query["orderId"].ToString();
                var amount = query["amount"].ToString();
                var resultCode = query["resultCode"].ToString();
                var message = query["message"].ToString();
                var signature = query["signature"].ToString();
                var transId = query["transId"].ToString();
                var responseTime = query["responseTime"].ToString();
                var extraData = query["extraData"].ToString();

                if (string.IsNullOrEmpty(signature))
                {
                    response.resultCode = -1;
                    response.message = "Missing signature";
                    return response;
                }

                // Tạo raw signature để kiểm tra theo đúng thứ tự
                var rawSignature = $"accessKey={_accessKey}&amount={amount}&extraData={extraData}&message={message}&orderId={orderId}&partnerCode={_partnerCode}&responseTime={responseTime}&resultCode={resultCode}&transId={transId}";
                
                _logger.LogInformation("Raw signature for validation: {RawSignature}", rawSignature);
                
                var computedSignature = HmacSha256(_secretKey, rawSignature);
                
                _logger.LogInformation("Computed signature: {ComputedSignature}", computedSignature);
                _logger.LogInformation("Received signature: {ReceivedSignature}", signature);
                
                if (computedSignature == signature)
                {
                    response.resultCode = int.Parse(resultCode);
                    response.message = message;
                    response.orderId = orderId;
                    response.amount = string.IsNullOrEmpty(amount) ? 0 : long.Parse(amount);
                    response.transId = transId;
                    
                    _logger.LogInformation("Return validation successful. ResultCode: {ResultCode}", resultCode);
                }
                else
                {
                    response.resultCode = -1;
                    response.message = "Invalid signature";
                    _logger.LogWarning("Return signature validation failed!");
                }
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating return response");
                return new MoMoPaymentResponse { resultCode = -1, message = ex.Message };
            }
        }

        public MoMoPaymentResponse ValidateIpnResponse(IQueryCollection query)
        {
            try
            {
                var response = new MoMoPaymentResponse();
                
                if (query == null || query.Count == 0)
                {
                    response.resultCode = -1;
                    response.message = "No response data";
                    return response;
                }
                
                var orderId = query["orderId"].ToString();
                var amount = query["amount"].ToString();
                var resultCode = query["resultCode"].ToString();
                var message = query["message"].ToString();
                var signature = query["signature"].ToString();
                var transId = query["transId"].ToString();
                var responseTime = query["responseTime"].ToString();
                var extraData = query["extraData"].ToString();

                if (string.IsNullOrEmpty(signature))
                {
                    response.resultCode = -1;
                    response.message = "Missing signature";
                    return response;
                }

                var rawSignature = $"accessKey={_accessKey}&amount={amount}&extraData={extraData}&message={message}&orderId={orderId}&partnerCode={_partnerCode}&responseTime={responseTime}&resultCode={resultCode}&transId={transId}";
                
                var computedSignature = HmacSha256(_secretKey, rawSignature);
                
                if (computedSignature == signature)
                {
                    response.resultCode = int.Parse(resultCode);
                    response.message = message;
                    response.orderId = orderId;
                    response.amount = string.IsNullOrEmpty(amount) ? 0 : long.Parse(amount);
                    response.transId = transId;
                    
                    _logger.LogInformation("IPN validation successful. ResultCode: {ResultCode}", resultCode);
                }
                else
                {
                    response.resultCode = -1;
                    response.message = "Invalid signature";
                    _logger.LogWarning("IPN signature validation failed!");
                }
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating IPN response");
                return new MoMoPaymentResponse { resultCode = -1, message = ex.Message };
            }
        }

        private string HmacSha256(string key, string data)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            
            using (var hmac = new HMACSHA256(keyBytes))
            {
                var hashBytes = hmac.ComputeHash(dataBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
    }

    public class MoMoPaymentRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public string ExtraData { get; set; } = string.Empty;
    }

    public class MoMoPaymentResponse
    {
        public int resultCode { get; set; }
        public string message { get; set; } = string.Empty;
        public string payUrl { get; set; } = string.Empty;
        public string qrCodeUrl { get; set; } = string.Empty;
        public string deeplink { get; set; } = string.Empty;
        public string orderId { get; set; } = string.Empty;
        public string requestId { get; set; } = string.Empty;
        public long amount { get; set; }
        public string transId { get; set; } = string.Empty;
        public string payType { get; set; } = string.Empty;
        public string signature { get; set; } = string.Empty;
    }
}