import { Link } from "react-router-dom";

interface AppCard {
  title: string;
  description: string;
  path: string;
  status: "live" | "coming-soon";
}

const APPS: AppCard[] = [
  {
    title: "Social Studies Diagnostic",
    description:
      "24-question conceptual diagnostic with automatic S/P/M/U evaluation, per-question detail, and cross-administration comparison. Each student's results are private to their own access code.",
    path: "/social-studies",
    status: "live",
  },
  {
    title: "Social Studies Lessons",
    description:
      "Printable lesson plans and student worksheets for the social studies curriculum, starting with Lesson 1.1: History, geography, civics, and economics as four lenses.",
    path: "/lessons",
    status: "live",
  },
];

export default function Landing() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>OrangeTee Labs</h1>
          <p className="muted">Diagnostic tools.</p>
        </div>
      </header>

      <div className="app-grid">
        {APPS.map((app) => (
          <div key={app.path} className="app-card">
            <h2>{app.title}</h2>
            <p className="muted">{app.description}</p>
            {app.status === "live" ? (
              <Link to={app.path} className="button">
                Open
              </Link>
            ) : (
              <span className="button secondary" aria-disabled="true">
                Coming soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
