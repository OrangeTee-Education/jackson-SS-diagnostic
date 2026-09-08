import { Link } from "react-router-dom";

interface LessonSummary {
  id: string;
  title: string;
  description: string;
  planPath: string;
  worksheetPath: string;
}

const LESSONS: LessonSummary[] = [
  {
    id: "1.1",
    title: "Lesson 1.1 — What Social Studies Asks",
    description:
      "Introduces history, geography, civics, and economics as four different kinds of questions that can be asked about the same real-world situation, using a Kansas warning-siren story as the anchor case.",
    planPath: "/lessons/1-1/plan",
    worksheetPath: "/lessons/1-1/worksheet",
  },
];

export default function LessonsHome() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← OrangeTee Labs
          </Link>
          <h1>Social Studies Lessons</h1>
          <p className="muted">Printable lesson plans and student worksheets.</p>
        </div>
      </header>

      <ul className="lesson-list">
        {LESSONS.map((lesson) => (
          <li key={lesson.id} className="lesson-row">
            <div className="lesson-row-info">
              <div className="session-name">{lesson.title}</div>
              <p className="muted">{lesson.description}</p>
            </div>
            <div className="button-row">
              <Link to={lesson.planPath} className="badge badge-link badge-plan">
                Lesson Plan
              </Link>
              <Link to={lesson.worksheetPath} className="badge badge-link badge-worksheet">
                Student Worksheet
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
