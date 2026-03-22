// components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

function AdminRoute({ isAuthenticated, user, children }) {
  console.log("AdminRoute check:", { 
    isAuthenticated, 
    user,
    userRole: user?.role,
    isAdmin: user?.role === "Admin"
  });

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Admin luôn được phép
  if (user?.role === "Admin") {
    console.log("Admin access granted");
    return children;
  }

  // Không phải admin thì redirect về home
  console.log("Not admin, redirecting to home");
  return <Navigate to="/" replace />;
}

export default AdminRoute;