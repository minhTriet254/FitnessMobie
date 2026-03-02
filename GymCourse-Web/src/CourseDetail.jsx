import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetail.css";

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5086/api/CourseController/course/${id}`)
      .then(res => res.json())
      .then(data => setCourse(data));
  }, [id]);

  if (!course) return <h2>Loading...</h2>;

  return (
    <div className="course-container">
      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back to Courses
      </button>

      <h1>{course.name}</h1>
      <p>{course.description}</p>

      <h2>Lessons</h2>

      <div className="lesson-grid">
        {course.lessons?.map(lesson => (
          <div
            key={lesson.id}
            className="lesson-card"
            onClick={() => navigate(`/lesson/${lesson.id}`)}
          >
            <h3>{lesson.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseDetail;