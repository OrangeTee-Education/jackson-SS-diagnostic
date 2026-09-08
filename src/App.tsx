import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import StudentGate from "./pages/StudentGate";
import StudentHome from "./pages/StudentHome";
import Administer from "./pages/Administer";
import Results from "./pages/Results";
import Compare from "./pages/Compare";
import LessonsHome from "./pages/lessons/LessonsHome";
import Lesson1_1Plan from "./pages/lessons/Lesson1_1Plan";
import Lesson1_1Worksheet from "./pages/lessons/Lesson1_1Worksheet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/social-studies" element={<StudentGate />} />
        <Route path="/social-studies/students/:studentId" element={<StudentHome />} />
        <Route path="/social-studies/students/:studentId/new" element={<Administer />} />
        <Route path="/social-studies/students/:studentId/sessions/:id" element={<Results />} />
        <Route path="/social-studies/students/:studentId/compare" element={<Compare />} />
        <Route path="/lessons" element={<LessonsHome />} />
        <Route path="/lessons/1-1/plan" element={<Lesson1_1Plan />} />
        <Route path="/lessons/1-1/worksheet" element={<Lesson1_1Worksheet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
