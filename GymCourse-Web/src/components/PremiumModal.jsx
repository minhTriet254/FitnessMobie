import { useState, useEffect } from "react";
import { premiumService } from "../services/premiumService";
import "./PremiumModal.css";

function PremiumModal({ isOpen, onClose, onSuccess }) {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    setFetchLoading(true);
    setError("");
    try {
      console.log("📦 Loading packages...");
      const data = await premiumService.getPackages();
      console.log("✅ Packages loaded:", data);
      
      setPackages(data);
      if (data.length > 0) {
        setSelectedPackage(data[0]);
      } else {
        setError("Không có gói premium nào khả dụng");
      }
    } catch (err) {
      console.error("❌ Error loading packages:", err);
      setError("Không thể tải gói premium. Vui lòng thử lại sau.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPackage) {
      setError("Vui lòng chọn gói premium");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("💳 Creating payment for package:", selectedPackage);
      
      const result = await premiumService.createPayment(selectedPackage.id);
      console.log("✅ Payment result:", result);
      
      if (result.success && result.payUrl) {
        console.log("🚀 Redirecting to MoMo:", result.payUrl);
        // Redirect to MoMo payment page
        window.location.href = result.payUrl;
      } else {
        throw new Error(result.message || "Không thể tạo thanh toán");
      }
      
    } catch (err) {
      console.error("❌ Payment error:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <div className="premium-modal-header">
          <h2>🎉 Nâng cấp tài khoản Premium</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="premium-modal-body">
          {error && (
            <div className="premium-error">
              <strong>❌ Lỗi:</strong> {error}
              <button 
                className="retry-button" 
                onClick={loadPackages}
                style={{ marginLeft: '10px', padding: '2px 8px' }}
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="premium-benefits">
            <h3>✨ Quyền lợi Premium:</h3>
            <ul>
              <li>Truy cập TẤT CẢ các khóa học premium</li>
              <li>Không giới hạn thời gian trong thời hạn</li>
              <li>Hỗ trợ ưu tiên 24/7</li>
              <li>Nội dung độc quyền mỗi tuần</li>
            </ul>
          </div>

          {fetchLoading ? (
            <div className="packages-loading">
              <div className="spinner"></div>
              <p>Đang tải gói premium...</p>
            </div>
          ) : (
            <>
              <div className="packages-grid">
                {packages.map(pkg => {
                  const finalPrice = pkg.finalPrice || pkg.price || 0;
                  const originalPrice = pkg.price || 0;
                  const hasDiscount = pkg.discountPrice && pkg.discountPrice < originalPrice;
                  const isSelected = selectedPackage?.id === pkg.id;
                  const savings = hasDiscount ? (originalPrice - finalPrice) : 0;
                  
                  return (
                    <div
                      key={pkg.id}
                      className={`package-card ${isSelected ? 'selected' : ''} ${hasDiscount ? 'has-discount' : ''}`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {hasDiscount && savings > 0 && (
                        <div className="discount-badge">
                          Tiết kiệm {formatCurrency(savings)}
                        </div>
                      )}
                      <h4>{pkg.name || 'Premium Package'}</h4>
                      <div className="package-price">
                        {hasDiscount ? (
                          <>
                            <span className="original-price">{formatCurrency(originalPrice)}</span>
                            <span className="discount-price">{formatCurrency(finalPrice)}</span>
                          </>
                        ) : (
                          <span className="final-price">{formatCurrency(finalPrice)}</span>
                        )}
                      </div>
                      <p className="package-description">{pkg.description || ''}</p>
                      {isSelected && (
                        <div className="selected-check">✓ Đã chọn</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="payment-info">
                <div className="momo-badge">
                  <img 
                    src="https://s3-ap-southeast-1.amazonaws.com/momo-upload/static/img/momo-logo-2.png" 
                    alt="MoMo" 
                    className="momo-logo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                  <span>Thanh toán qua ví MoMo</span>
                </div>
                {selectedPackage && (
                  <div className="payment-amount">
                    <span>Tổng tiền: </span>
                    <strong>{formatCurrency(selectedPackage.finalPrice || selectedPackage.price)}</strong>
                  </div>
                )}
              </div>

              <button
                className="btn-upgrade"
                onClick={handleUpgrade}
                disabled={loading || !selectedPackage}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang xử lý...
                  </>
                ) : (
                  `Nâng cấp ngay - ${selectedPackage ? formatCurrency(selectedPackage.finalPrice || selectedPackage.price) : ''}`
                )}
              </button>
            </>
          )}

          <p className="security-note">
            🔒 Thanh toán an toàn qua MoMo. Hỗ trợ thẻ tín dụng, thẻ ATM và ví MoMo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PremiumModal;