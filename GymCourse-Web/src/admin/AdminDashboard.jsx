import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import CourseManagement from "./CourseManagement";
import LessonManagement from "./LessonManagement";
import UserManagement from "./UserManagement";
import RevenueManagement from "./RevenueManagement";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin">🏠 Dashboard</Link>
          <Link to="/admin/courses">📚 Courses</Link>
          <Link to="/admin/users">👥 Users</Link>
          <Link to="/admin/revenue">💰 Revenue</Link>
        </nav>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/courses/:courseId/lessons" element={<LessonManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/revenue" element={<RevenueManagement />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminHome() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Lấy doanh thu tháng này
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const startDate = firstDayOfMonth.toISOString().split("T")[0];
      const endDate = lastDayOfMonth.toISOString().split("T")[0];
      
      const response = await axios.get(
        `http://localhost:5086/api/Premium/admin/revenue?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRevenueData(response.data);
      setRecentTransactions(response.data.transactions?.slice(0, 5) || []);
      setError("");
    } catch (err) {
      console.error("Error fetching revenue:", err);
      setError("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <h1>Welcome to Admin Dashboard</h1>
      <p>Quản lý và theo dõi hoạt động của hệ thống</p>

      {error && <div className="error-message">{error}</div>}

      {/* Hiển thị Revenue Management ngay tại đây */}
      <div className="dashboard-revenue">
        <div className="section-header">
          <h2>💰 Doanh Thu MoMo</h2>
          <Link to="/admin/revenue" className="view-all-link">
            Xem chi tiết →
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="revenue-summary">
          <div className="summary-card total">
            <div className="card-icon">💰</div>
            <div className="card-info">
              <h3>Tổng doanh thu tháng này</h3>
              <div className="amount">
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </div>
              <div className="stat-sub">
                {revenueData?.totalTransactions || 0} giao dịch
              </div>
            </div>
          </div>

          <div className="summary-card average">
            <div className="card-icon">⭐</div>
            <div className="card-info">
              <h3>Trung bình mỗi giao dịch</h3>
              <div className="amount">
                {formatCurrency(revenueData?.averageAmount || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h3>📋 Giao dịch gần đây</h3>
          
          {recentTransactions.length === 0 ? (
            <div className="no-data">
              <span>📭</span>
              <p>Chưa có giao dịch nào trong tháng này</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Người dùng</th>
                    <th>Số tiền</th>
                    <th>Số tháng</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className="transaction-id">
                          {transaction.transactionId?.substring(0, 12)}...
                        </span>
                      </td>
                      <td>
                        <strong>{transaction.userName}</strong>
                      </td>
                      <td className="amount-cell">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        <span className="months-badge">
                          {transaction.months} tháng
                        </span>
                      </td>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${transaction.status}`}>
                          {transaction.status === "success" ? "✅ Thành công" : "❌ Thất bại"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-revenue {
          margin-top: 30px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .view-all-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
        }

        .view-all-link:hover {
          color: #764ba2;
          transform: translateX(3px);
        }

        .revenue-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s;
        }

        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .summary-card.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .summary-card.average {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .card-icon {
          font-size: 3rem;
          opacity: 0.9;
        }

        .card-info {
          flex: 1;
        }

        .card-info h3 {
          margin: 0 0 10px 0;
          font-size: 0.95rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .card-info .amount {
          font-size: 2rem;
          font-weight: bold;
          margin: 0 0 5px 0;
        }

        .stat-sub {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .recent-transactions {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .recent-transactions h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.2rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .transaction-id {
          font-family: monospace;
          font-size: 0.85rem;
          color: #666;
        }

        .amount-cell {
          font-weight: 600;
          color: #27ae60;
        }

        .months-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.failed {
          background: #ffebee;
          color: #c62828;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .no-data span {
          font-size: 3rem;
          display: block;
          margin-bottom: 10px;
        }

        .no-data p {
          color: #999;
          margin: 0;
        }

        @media (max-width: 768px) {
          .revenue-summary {
            grid-template-columns: 1fr;
          }

          .card-info .amount {
            font-size: 1.5rem;
          }

          .recent-transactions {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;