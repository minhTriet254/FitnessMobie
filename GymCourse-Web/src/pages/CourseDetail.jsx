import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetail.css";

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    fetch(`http://localhost:5086/api/CourseController/course/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load course details");
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div className="error">Course not found</div>;

  return (
    <div className="course-container">
      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back to Courses
      </button>

      <h1>{course.name}</h1>
      <p className="course-description">{course.description}</p>

      <h2>Lessons</h2>

      <div className="lesson-grid">
        {course.lessons?.length > 0 ? (
          course.lessons.map(lesson => (
            <div
              key={lesson.id}
              className="lesson-card"
              onClick={() => navigate(`/lesson/${lesson.id}`)}
            >
              <h3>{lesson.title}</h3>
              <p>Click to view lesson</p>
            </div>
          ))
        ) : (
          <p>No lessons available for this course</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;