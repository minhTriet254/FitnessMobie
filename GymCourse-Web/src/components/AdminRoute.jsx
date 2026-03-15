// components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

function AdminRoute({ children, isAuthenticated, user }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default AdminRoute;