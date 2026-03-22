import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "",
    courseType: "free",  // "free" hoặc "premium"
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchCourses();
    } else {
      setError("No authentication token found");
    }
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5086/api/CourseController/courses", {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch courses");
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
      }
      
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new course
  const createCourse = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5086/api/CourseController", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || "",
          price: formData.courseType === "premium" ? 1 : 0
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create course");
      }

      await fetchCourses();
      setShowForm(false);
      setFormData({ name: "", description: "", courseType: "free", price: 0 });
      setError("");
      
    } catch (error) {
      console.error("Error creating course:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update existing course
  const updateCourse = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5086/api/CourseController/${editingCourse.id}`, {
        method: "PUT",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || "",
          price: formData.courseType === "premium" ? 1 : 0
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to update course");
      }

      await fetchCourses();
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: "", description: "", courseType: "free", price: 0 });
      setError("");
      
    } catch (error) {
      console.error("Error updating course:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên khóa học");
      return;
    }

    if (editingCourse) {
      await updateCourse();
    } else {
      await createCourse();
    }
  };

  // Handle delete course
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;

    try {
      const response = await fetch(`http://localhost:5086/api/CourseController/${id}`, {
        method: "DELETE",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      await fetchCourses();
      
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Không thể xóa khóa học");
    }
  };

  // Handle edit button click
  const handleEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({ 
      name: course.name, 
      description: course.description || "",
      courseType: course.price > 0 ? "premium" : "free",
      price: course.price || 0
    });
    setShowForm(true);
    setError("");
  };

  // Handle cancel button
  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({ name: "", description: "", courseType: "free", price: 0 });
    setError("");
  };

  // Handle course type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({ 
      ...formData, 
      courseType: newType,
      price: newType === "premium" ? 1 : 0
    });
  };

  // Format price display
  const formatPrice = (price) => {
    if (price === 0) return "🎓 Free";
    if (price === 1) return "⭐ Premium";
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  // Get badge class for price
  const getPriceBadgeClass = (price) => {
    if (price === 0) return "badge-free";
    if (price === 1) return "badge-premium";
    return "badge-paid";
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>📚 Quản lý khóa học</h2>
        <button 
          onClick={() => { 
            setShowForm(true); 
            setEditingCourse(null); 
            setFormData({ name: "", description: "", courseType: "free", price: 0 }); 
            setError("");
          }} 
          className="btn-primary"
          disabled={loading}
        >
          + Thêm khóa học mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {loading && !showForm && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Đang tải khóa học...</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form course-form">
          <h3>{editingCourse ? "✏️ Chỉnh sửa khóa học" : "📖 Tạo khóa học mới"}</h3>
          
          <div className="form-group">
            <label htmlFor="name">Tên khóa học <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên khóa học"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Loại khóa học - Select dropdown */}
          <div className="form-group">
            <label htmlFor="courseType">Loại khóa học</label>
            <select
              id="courseType"
              name="courseType"
              value={formData.courseType}
              onChange={handleTypeChange}
              className="course-type-select"
              disabled={loading}
            >
              <option value="free">🎓 Khóa học Miễn phí</option>
              <option value="premium">⭐ Khóa học Premium</option>
            </select>
            <small className="form-hint">
              {formData.courseType === "premium" 
                ? "🔒 Khóa học premium chỉ dành cho thành viên Premium" 
                : "🎉 Khóa học miễn phí cho tất cả người dùng"}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả (Tùy chọn)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả khóa học"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : (editingCourse ? "Cập nhật khóa học" : "Tạo khóa học")}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="courses-list">
        <h3>Danh sách khóa học ({courses.length})</h3>
        
        {courses.length === 0 && !loading ? (
          <div className="no-data">
            <span>📭</span>
            <p>Chưa có khóa học nào</p>
            <button onClick={() => { 
              setShowForm(true); 
              setEditingCourse(null); 
              setFormData({ name: "", description: "", courseType: "free", price: 0 }); 
            }} className="btn-primary">
              Tạo khóa học đầu tiên
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khóa học</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr 
                  key={course.id}
                  className="clickable-row"
                  onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                >
                  <td>{course.id}</td>
                  <td>
                    <strong>{course.name}</strong>
                  </td>
                  <td>
                    <span className={`price-badge ${getPriceBadgeClass(course.price)}`}>
                      {formatPrice(course.price)}
                    </span>
                  </td>
                  <td className="course-description">
                    {course.description || <span className="text-muted">—</span>}
                  </td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleEdit(course, e)} 
                      className="btn-edit"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={(e) => handleDelete(course.id, e)} 
                      className="btn-delete"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CourseManagement;