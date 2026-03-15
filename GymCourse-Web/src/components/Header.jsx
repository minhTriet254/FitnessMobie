import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import "./Header.css";

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Gọi hàm logout từ authService
    authService.logout();
    // Gọi callback onLogout từ App.js để cập nhật state
    onLogout();
    // Điều hướng về trang login
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (user?.role === "Admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleLogoClick}>
          <h1>GymCourse</h1>
        </div>
        
        {user && (
          <div className="user-info">
            <div className="user-details">
              <span className="welcome-text">Welcome,</span>
              <span className="username">{user.userName}</span>
              <span className={`user-role ${user.role?.toLowerCase()}`}>
                ({user.role})
              </span>
            </div>
            
            <div className="header-actions">
              {user.role === "Admin" && (
                <Link to="/admin" className="admin-link">
                  <i className="fas fa-cog"></i> Dashboard
                </Link>
              )}
              
              <button onClick={handleLogout} className="logout-button">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;