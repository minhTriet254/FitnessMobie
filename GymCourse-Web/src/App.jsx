import { Routes, Route } from "react-router-dom";
import CourseList from "./CourseList";
import CourseDetail from "./CourseDetail";
import LessonDetail from "./LessonDetail";
function App() {
  return (
    <Routes>
      <Route path="/" element={<CourseList />} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/lesson/:id" element={<LessonDetail />} />
    </Routes>
  );
}

export default App;