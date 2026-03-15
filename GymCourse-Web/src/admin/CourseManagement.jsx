import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: ""
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
      console.log("Fetching courses with token:", token);
      
      const response = await fetch("http://localhost:5086/api/CourseController/courses", {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Response status:", response.status);
      
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
      console.log("Courses data:", data);
      
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        console.error("Invalid data format:", data);
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
          description: formData.description || ""
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create course");
      }

      await fetchCourses();
      setShowForm(false);
      setFormData({ name: "", description: "" });
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
          description: formData.description || ""
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to update course");
      }

      await fetchCourses();
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: "", description: "" });
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
      setError("Course name is required");
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
    if (!window.confirm("Are you sure you want to delete this course?")) return;

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
      setError("Failed to delete course");
    }
  };

  // Handle edit button click
  const handleEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({ 
      name: course.name, 
      description: course.description || "" 
    });
    setShowForm(true);
    setError("");
  };

  // Handle cancel button
  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({ name: "", description: "" });
    setError("");
  };



  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Course Management</h2>
        <button 
          onClick={() => { 
            setShowForm(true); 
            setEditingCourse(null); 
            setFormData({ name: "", description: "" }); 
            setError("");
          }} 
          className="btn-primary"
          disabled={loading}
        >
          + Add New Course
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && !showForm && (
        <div className="loading-indicator">Loading courses...</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingCourse ? "Edit Course" : "Create New Course"}</h3>
          
          <div className="form-group">
            <label htmlFor="name">Course Name <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter course name"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter course description"
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
              {loading ? "Saving..." : (editingCourse ? "Update Course" : "Create Course")}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="courses-list">
        <h3>All Courses ({courses.length})</h3>
        
        {courses.length === 0 && !loading ? (
          <p className="no-data">No courses found. Click "Add New Course" to create one.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Course Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr 
                  key={course.id}
                  className="clickable-row"
                  onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{course.id}</td>
                  <td>
                    <strong>{course.name}</strong>
                  </td>
                  <td>
                    {course.description || <span className="text-muted">No description</span>}
                  </td>

                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleEdit(course, e)} 
                      className="btn-edit"
                      title="Edit course"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={(e) => handleDelete(course.id, e)} 
                      className="btn-delete"
                      title="Delete course"
                    >
                      🗑️ Delete
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