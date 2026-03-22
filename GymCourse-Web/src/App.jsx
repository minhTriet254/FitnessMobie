import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import LessonDetail from "./pages/LessonDetail";
import AdminDashboard from "./admin/AdminDashboard";
import PremiumSuccess from "./pages/PremiumSuccess";
import PremiumFailed from "./pages/PremiumFailed";
import PremiumMockPayment from "./pages/PremiumMockPayment";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token và user khi app load
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    // Xóa dữ liệu trong localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mock_premium"); // Xóa cả mock premium nếu có
    
    // Cập nhật state
    setIsAuthenticated(false);
    setUser(null);
    
    console.log("Logged out successfully");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <AuthProvider value={{ user, isAuthenticated, login: handleLogin, logout: handleLogout }}>
      {/* Hiển thị Header nếu đã đăng nhập */}
      {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
      
      <Routes>
        {/* Public routes - không cần đăng nhập */}
        <Route path="/login" element={
          isAuthenticated ? 
            <Navigate to={user?.role === "Admin" ? "/admin" : "/"} replace /> : 
            <Login onLogin={handleLogin} />
        } />
        
        <Route path="/register" element={
          isAuthenticated ? 
            <Navigate to={user?.role === "Admin" ? "/admin" : "/"} replace /> : 
            <Register onLogin={handleLogin} />
        } />

        {/* Premium routes - public để VNPay có thể redirect về */}
        <Route path="/premium-success" element={<PremiumSuccess />} />
        <Route path="/premium-failed" element={<PremiumFailed />} />
        <Route path="/premium-mock" element={<PremiumMockPayment />} />

        {/* Protected routes - yêu cầu đăng nhập */}
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <CourseList />
          </ProtectedRoute>
        } />
        
        <Route path="/course/:id" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <CourseDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/lesson/:id" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <LessonDetail />
          </ProtectedRoute>
        } />

        {/* Admin routes - yêu cầu role Admin */}
        <Route path="/admin/*" element={
          <AdminRoute isAuthenticated={isAuthenticated} user={user}>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;