import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoManagement from "./VideoManagement";
import "./AdminDashboard.css";

function LessonManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showVideoManagement, setShowVideoManagement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Debug: Log khi component mount
  useEffect(() => {
    console.log("========== LESSON MANAGEMENT MOUNTED ==========");
    console.log("Course ID from params:", courseId);
    console.log("Type of courseId:", typeof courseId);
    console.log("Token exists:", !!token);
    console.log("Current URL:", window.location.href);
    
    if (courseId) {
      // Reset state khi courseId thay đổi
      setCourse(null);
      setLessons([]);
      setEditingLesson(null);
      setShowForm(false);
      setFormData({ title: "" });
      setSelectedLesson(null);
      setShowVideoManagement(false);
      
      fetchCourseDetails();
    } else {
      console.error("No courseId in params!");
    }
  }, [courseId, token]);

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      console.log("Fetching course details for ID:", courseId);
      const response = await fetch(`http://localhost:5086/api/CourseController/course/${courseId}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Course details response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const data = await response.json();
      console.log("Course details:", data);
      console.log("Lessons from course:", data.lessons);
      
      setCourse(data);
      
      // Lấy lessons từ course details thay vì call API riêng
      if (data.lessons && Array.isArray(data.lessons)) {
        setLessons(data.lessons);
      } else {
        setLessons([]);
      }
      
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to load course details");
    }
  };

  // Fetch lessons for this course
  const fetchLessons = async () => {
    try {
      console.log("Fetching lessons for course ID:", courseId);
      
      const url = `http://localhost:5086/api/LessonController/Lesson?courseId=${courseId}`;
      console.log("Fetching from URL:", url);
      console.log("Token:", token ? "Present" : "Missing");
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Lessons response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error(`Failed to fetch lessons: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Lessons data received:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));
      
      // Đảm bảo dữ liệu là array
      if (Array.isArray(data)) {
        console.log("Total lessons from API:", data.length);
        setLessons(data);
      } else {
        console.error("Invalid data format. Expected array, got:", data);
        setLessons([]);
      }
      
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setError(`Failed to load lessons: ${error.message}`);
    }
  };

  // Create new lesson
  const createLesson = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5086/api/LessonController/CourseId?CourseId=${courseId}`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || ""
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create lesson");
      }

      await fetchCourseDetails();
      setShowForm(false);
      setFormData({ title: "", content: "" });
      setError("");
      
    } catch (error) {
      console.error("Error creating lesson:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update lesson
  const updateLesson = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5086/api/LessonController/${editingLesson.id}`, {
        method: "PUT",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || ""
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to update lesson");
      }

      await fetchCourseDetails();
      setShowForm(false);
      setEditingLesson(null);
      setFormData({ title: "", content: "" });
      setError("");
      
    } catch (error) {
      console.error("Error updating lesson:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const response = await fetch(`http://localhost:5086/api/LessonController/${lessonId}`, {
        method: "DELETE",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      await fetchCourseDetails();
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
        setShowVideoManagement(false);
      }
      
    } catch (error) {
      console.error("Error deleting lesson:", error);
      setError("Failed to delete lesson");
    }
  };

  // Handle lesson click to view videos
  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setShowVideoManagement(true);
  };

  // Handle back to lessons from videos
  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setShowVideoManagement(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Lesson title is required");
      return;
    }

    if (editingLesson) {
      await updateLesson();
    } else {
      await createLesson();
    }
  };

  // Handle edit button click
  const handleEdit = (lesson, e) => {
    e.stopPropagation();
    setEditingLesson(lesson);
    setFormData({ title: lesson.title, content: lesson.content || "" });
    setShowForm(true);
    setError("");
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingLesson(null);
    setFormData({ title: "", content: "" });
    setError("");
  };

  // Nếu không có courseId, hiển thị thông báo lỗi
  if (!courseId) {
    return (
      <div className="admin-section">
        <div className="error-message">
          No course ID provided. Please go back and select a course.
        </div>
        <button onClick={() => navigate("/admin/courses")} className="btn-primary">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>
          <button onClick={() => navigate("/admin/courses")} className="back-button-small">
            ← Back to Courses
          </button>
          {course ? (
            <span>Lessons for: <strong>{course.name}</strong> (ID: {course.id})</span>
          ) : (
            <span>Loading course details...</span>
          )}
        </h2>
        {!showVideoManagement && (
          <button 
            onClick={() => { 
              setShowForm(true); 
              setEditingLesson(null); 
              setFormData({ title: "", content: "" }); 
              setError("");
            }} 
            className="btn-primary"
            disabled={loading}
          >
            + Add New Lesson
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Debug info - sẽ hiển thị trong quá trình phát triển */}
      <div className="debug-info" style={{
        background: "#e3f2fd",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px",
        fontSize: "0.9rem",
        display: process.env.NODE_ENV === "development" ? "block" : "none"
      }}>
        <strong>Debug:</strong> Course ID: {courseId} | 
        Lessons found: {lessons.length} | 
        {lessons.length > 0 && (
          <>First lesson courseId: {lessons[0]?.courseId}</>
        )}
      </div>

      {!showVideoManagement ? (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <h3>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</h3>
              
              <div className="form-group">
                <label htmlFor="title">Lesson Title <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter lesson title"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content (Optional)</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter lesson content"
                  rows="4"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : (editingLesson ? "Update Lesson" : "Create Lesson")}
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

          <div className="lessons-list">
            <h3>All Lessons ({lessons.length})</h3>
            
            {lessons.length === 0 ? (
              <p className="no-data">No lessons found for this course. Click "Add New Lesson" to create one.</p>
            ) : (
              <div className="lesson-grid">
                {lessons.map(lesson => (
                  <div 
                    key={lesson.id} 
                    className="lesson-card"
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="lesson-card-header">
                      <h4>{lesson.title}</h4>
                      <small>Course ID: {lesson.courseId}</small>
                    </div>
                    
                    <div className="lesson-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handleEdit(lesson, e)} 
                        className="btn-edit btn-small"
                        title="Edit lesson"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => handleDeleteLesson(lesson.id, e)} 
                        className="btn-delete btn-small"
                        title="Delete lesson"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <VideoManagement 
          lesson={selectedLesson}
          onBack={handleBackToLessons}
          token={token}
        />
      )}
    </div>
  );
}

export default LessonManagement;