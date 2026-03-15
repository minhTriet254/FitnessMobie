import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = (redirectTo = "/login") => {
    // Xóa dữ liệu trong localStorage
    authService.logout();
    
    // Điều hướng
    navigate(redirectTo);
    
    // Optional: Reload page để reset state
    // window.location.reload();
  };

  return { logout };
};