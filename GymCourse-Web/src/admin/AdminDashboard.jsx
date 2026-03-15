import { Routes, Route, Link } from "react-router-dom";
import CourseManagement from "./CourseManagement";
import LessonManagement from "./LessonManagement";
import UserManagement from "./UserManagement";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin/courses">📚 Courses</Link>
          <Link to="/admin/users">👥 Users</Link>
        </nav>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/courses/:courseId/lessons" element={<LessonManagement />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminHome() {
  return (
    <div className="admin-home">
      <h1>Welcome to Admin Dashboard</h1>
      <p>Select a management option from the sidebar</p>
    </div>
  );
}

export default AdminDashboard;