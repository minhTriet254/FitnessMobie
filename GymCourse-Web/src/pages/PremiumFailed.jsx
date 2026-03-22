import { useSearchParams, useNavigate } from "react-router-dom";

function PremiumFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get("message") || "Có lỗi xảy ra trong quá trình thanh toán";
  const code = searchParams.get("code");

  const getErrorMessage = () => {
    if (code === "24") return "Bạn đã hủy giao dịch thanh toán";
    if (code === "51") return "Tài khoản không đủ số dư";
    if (code === "13") return "Sai mật khẩu OTP";
    if (code === "97") return "Sai chữ ký, vui lòng thử lại";
    if (message) return decodeURIComponent(message);
    return "Có lỗi xảy ra trong quá trình thanh toán";
  };

  const handleRetry = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="payment-result-container">
      <div className="failed-card">
        <div className="failed-icon">❌</div>
        <h1>Thanh toán thất bại</h1>
        <p className="error-message">{getErrorMessage()}</p>
        
        {code && (
          <p className="error-code">Mã lỗi: {code}</p>
        )}
        
        <div className="actions">
          <button onClick={handleGoHome} className="btn-home">
            Về trang chủ
          </button>
          <button onClick={handleRetry} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default PremiumFailed;