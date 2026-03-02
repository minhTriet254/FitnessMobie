import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5086/api/CourseController/courses")
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Courses</h1>

      {courses.map(course => (
        <div
          key={course.id}
          onClick={() => navigate(`/course/${course.id}`)}
          style={{
            padding: 20,
            border: "1px solid #ccc",
            marginBottom: 15,
            cursor: "pointer",
            borderRadius: 6
          }}
        >
          <h3>{course.name}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
}

export default CourseList;