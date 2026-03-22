import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function PremiumMockPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const packageId = searchParams.get("package");
    console.log("Processing payment for package:", packageId);

    // Giả lập xử lý thanh toán
    const timer = setTimeout(() => {
      setStatus("success");
      
      // Đếm ngược để chuyển về trang chủ
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/");
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="payment-mock-container">
      {status === "processing" ? (
        <div className="mock-card">
          <div className="spinner-large"></div>
          <h2>Đang xử lý thanh toán...</h2>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      ) : (
        <div className="mock-card success">
          <div className="success-icon">✅</div>
          <h2>Thanh toán thành công!</h2>
          <p>Bạn đã trở thành thành viên Premium</p>
          <p className="redirect-note">Tự động chuyển về trang chủ sau {countdown} giây</p>
          <button onClick={() => navigate("/")} className="btn-home">
            Về trang chủ ngay
          </button>
        </div>
      )}
    </div>
  );
}

export default PremiumMockPayment;