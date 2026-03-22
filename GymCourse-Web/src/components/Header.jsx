import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { authService } from "../services/authService";
import { premiumService } from "../services/premiumService";
import PremiumModal from "./PremiumModal";
import "./Header.css";

function Header({ user, onLogout }) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "Admin") {
      checkPremiumStatus();
    }
  }, [user]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const status = await premiumService.checkStatus();
      setPremiumStatus(status);
    } catch (err) {
      console.error("Error checking premium:", err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (user?.role === "Admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleUpgradeClick = () => {
    setShowDropdown(false);
    setShowPremiumModal(true);
  };

  const handlePremiumSuccess = () => {
    setShowPremiumModal(false);
    checkPremiumStatus();
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    // Có thể điều hướng đến trang profile nếu có
    // navigate("/profile");
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={handleLogoClick}>
            <h1>GymCourse</h1>
          </div>
          
          {user && (
            <div className="user-info">
              {/* User Avatar và Dropdown */}
              <div className="user-dropdown-container" ref={dropdownRef}>
                <div 
                  className="user-details" 
                  onClick={handleUserClick}
                >
                  <div className="user-avatar">
                    {user.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-text">
                    <span className="welcome-text">Welcome,</span>
                    <span className="username">{user.userName}</span>
                  </div>
                  <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="dropdown-menu">
                    {/* Premium Status */}
                    {user.role !== "Admin" && (
                      <div className="dropdown-premium-status">
                        {premiumStatus?.isPremium ? (
                          <div className="premium-active">
                            <span className="premium-icon">⭐</span>
                            <div className="premium-info">
                              <strong>Premium Active</strong>
                              <small>Còn {premiumStatus.daysRemaining} ngày</small>
                            </div>
                          </div>
                        ) : (
                          <div className="premium-inactive">
                            <span className="premium-icon">🔒</span>
                            <div className="premium-info">
                              <strong>Free Account</strong>
                              <small>Nâng cấp để có thêm quyền lợi</small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="dropdown-menu-items">
                      <button onClick={handleViewProfile} className="dropdown-item">
                        <span className="item-icon">👤</span>
                        Profile
                      </button>

                      {user.role === "Admin" && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          <span className="item-icon">📊</span>
                          Admin Dashboard
                        </Link>
                      )}

                      {user.role !== "Admin" && !premiumStatus?.isPremium && (
                        <button onClick={handleUpgradeClick} className="dropdown-item upgrade">
                          <span className="item-icon">⭐</span>
                          <span className="upgrade-text">Nâng cấp Premium</span>
                          <span className="hot-badge">HOT</span>
                        </button>
                      )}

                      {user.role !== "Admin" && premiumStatus?.isPremium && (
                        <button onClick={handleUpgradeClick} className="dropdown-item">
                          <span className="item-icon">⏳</span>
                          Gia hạn Premium
                        </button>
                      )}

                      <div className="dropdown-divider"></div>

                      <button onClick={handleLogout} className="dropdown-item logout">
                        <span className="item-icon">🚪</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Actions (giữ nguyên cho màn hình lớn) */}
              <div className="header-actions desktop-only">
                {user.role === "Admin" && (
                  <Link to="/admin" className="admin-link">
                    <i className="fas fa-cog"></i> Dashboard
                  </Link>
                )}
                
                {user.role !== "Admin" && premiumStatus?.isPremium && (
                  <span className="premium-badge-header">
                    ⭐ Premium
                  </span>
                )}

              </div>
            </div>
          )}
        </div>
      </header>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={handlePremiumSuccess}
      />
    </>
  );
}

export default Header;