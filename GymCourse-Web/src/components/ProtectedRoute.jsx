import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  console.log("ProtectedRoute check:", { token, userStr }); // Debug log

  if (!token) {
    console.log("No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    try {
      const user = JSON.parse(userStr || "{}");
      console.log("User role:", user.role, "Required:", requiredRole);
      
      if (user.role !== requiredRole) {
        console.log("Insufficient role, redirecting to home");
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      console.error("Error parsing user:", e);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;