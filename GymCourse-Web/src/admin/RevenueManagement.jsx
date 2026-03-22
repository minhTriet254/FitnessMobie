
import { useState, useEffect } from "react";
import axios from "axios";

function RevenueManagement() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5086/api/Premium/admin/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRevenueData(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching revenue:", err);
      setError("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchRevenue();
  };

  const handleReset = () => {
    setDateRange({
      startDate: new Date(new Date().setDate(1)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });
    setTimeout(() => fetchRevenue(), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
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
      <div className="admin-section">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu doanh thu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>💰 Doanh Thu MoMo</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="revenue-filter">
        <div className="filter-group">
          <label>Từ ngày</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
          />
        </div>
        <div className="filter-actions">
          <button className="btn-primary" onClick={handleFilter}>
            Lọc dữ liệu
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </div>

      <div className="revenue-summary">
        <div className="summary-card total">
          <div className="card-icon">💰</div>
          <div className="card-info">
            <h3>Tổng doanh thu</h3>
            <div className="amount">
              {formatCurrency(revenueData?.totalRevenue || 0)}
            </div>
          </div>
        </div>

        <div className="summary-card transactions">
          <div className="card-icon">📊</div>
          <div className="card-info">
            <h3>Số giao dịch</h3>
            <div className="count">{revenueData?.totalTransactions || 0}</div>
          </div>
        </div>

        <div className="summary-card average">
          <div className="card-icon">⭐</div>
          <div className="card-info">
            <h3>Trung bình/GD</h3>
            <div className="amount">
              {formatCurrency(revenueData?.averageAmount || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="section-header">
          <h3>📋 Lịch sử giao dịch</h3>
          <span className="transaction-count">
            Tổng số: {revenueData?.transactions?.length || 0} giao dịch
          </span>
        </div>

        {revenueData?.transactions?.length === 0 ? (
          <div className="no-data">
            <span>📭</span>
            <p>Chưa có giao dịch nào trong khoảng thời gian này</p>
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
                {revenueData?.transactions?.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className="transaction-id">
                        {transaction.transactionId?.substring(0, 15)}...
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

      <style>{`
        .revenue-filter {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .filter-group {
          flex: 1;
          min-width: 150px;
        }

        .filter-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
          font-size: 0.9rem;
        }

        .filter-group input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .filter-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .filter-actions {
          display: flex;
          gap: 10px;
        }

        .revenue-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .summary-card.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .summary-card.transactions {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .summary-card.average {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .card-icon {
          font-size: 2.5rem;
          opacity: 0.9;
        }

        .card-info {
          flex: 1;
        }

        .card-info h3 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .card-info .amount,
        .card-info .count {
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
        }

        .transactions-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .transactions-section .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .transactions-section .section-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2rem;
        }

        .transaction-count {
          color: #666;
          font-size: 0.9rem;
          background: #f5f5f5;
          padding: 5px 12px;
          border-radius: 20px;
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
          .revenue-filter {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-actions {
            justify-content: flex-end;
          }

          .revenue-summary {
            grid-template-columns: 1fr;
          }

          .card-info .amount,
          .card-info .count {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}

export default RevenueManagement;