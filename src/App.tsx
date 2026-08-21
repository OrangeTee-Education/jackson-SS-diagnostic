import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Administer from "./pages/Administer";
import Results from "./pages/Results";
import Compare from "./pages/Compare";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/social-studies" element={<Home />} />
        <Route path="/social-studies/new" element={<Administer />} />
        <Route path="/social-studies/sessions/:id" element={<Results />} />
        <Route path="/social-studies/compare" element={<Compare />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
