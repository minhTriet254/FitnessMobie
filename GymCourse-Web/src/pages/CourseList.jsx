import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    fetch("http://localhost:5086/api/CourseController/courses", {
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
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load courses");
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Courses</h1>

      {courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        courses.map(course => (
          <div
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            style={{
              padding: 20,
              border: "1px solid #ccc",
              marginBottom: 15,
              cursor: "pointer",
              borderRadius: 6,
              transition: "all 0.3s ease",
              backgroundColor: "#f9f9f9"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9f9f9";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h3>{course.name}</h3>
            <p>{course.description}</p>
            <small>{course.lessons?.length || 0} lessons</small>
          </div>
        ))
      )}
    </div>
  );
}

export default CourseList;