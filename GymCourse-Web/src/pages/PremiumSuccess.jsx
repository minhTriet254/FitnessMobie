import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { premiumService } from "../services/premiumService";

function PremiumSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: null,
    months: null,
    transactionNo: null
  });

  useEffect(() => {
    // Lấy thông tin từ URL params
    const amount = searchParams.get("amount");
    const months = searchParams.get("months");
    const expiry = searchParams.get("expiry");
    const transactionNo = searchParams.get("transactionNo");

    setPaymentInfo({
      amount: amount ? parseInt(amount) : null,
      months: months ? parseInt(months) : null,
      transactionNo: transactionNo
    });

    console.log("🎉 Payment successful:", { amount, months, expiry, transactionNo });

    // Cập nhật lại trạng thái premium
    const updatePremiumStatus = async () => {
      try {
        const status = await premiumService.checkStatus();
        if (status.success && status.isPremium) {
          console.log("✅ Premium status updated:", status);
        }
      } catch (error) {
        console.error("Error updating premium status:", error);
      }
    };

    updatePremiumStatus();
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/");
    }, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate, searchParams]);

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="payment-result-container">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Nâng cấp thành công!</h1>
        <p>Chúc mừng bạn đã trở thành thành viên Premium</p>
        
        {paymentInfo.amount && (
          <div className="payment-details">
            <div className="detail-item">
              <span>Số tiền:</span>
              <strong>{formatCurrency(paymentInfo.amount)}</strong>
            </div>
            {paymentInfo.months && (
              <div className="detail-item">
                <span>Thời hạn:</span>
                <strong>{paymentInfo.months} tháng</strong>
              </div>
            )}
            {paymentInfo.transactionNo && (
              <div className="detail-item">
                <span>Mã giao dịch:</span>
                <strong className="transaction-id">{paymentInfo.transactionNo}</strong>
              </div>
            )}
          </div>
        )}
        
        <p className="redirect-note">
          Tự động chuyển về trang chủ sau {countdown} giây
        </p>
        <button onClick={() => navigate("/")} className="btn-home">
          Về trang chủ ngay
        </button>
      </div>
    </div>
  );
}

export default PremiumSuccess;