import { Link } from "react-router-dom";

// Self-contained apps that live as plain files under public/stand-alone-apps/<name>/.
// They are separate pages, not routes in this app, so each card uses a normal link (full page load);
// a router <Link> would send the visitor to this app's catch-all route instead.
interface StandaloneApp {
  title: string;
  description: string;
  href: string;
}

const APPS: StandaloneApp[] = [
  {
    title: "Correlation Lab",
    description:
      "What does a correlation number actually look like? Move a slider, watch the dots change, then test your eye for patterns. No formulas needed.",
    href: "/stand-alone-apps/correlation-lab/",
  },
];

export default function StandaloneApps() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← OrangeTee Labs
          </Link>
          <h1>Stand-alone Apps</h1>
          <p className="muted">Self-contained interactive apps. Each one opens on its own page.</p>
        </div>
      </header>

      <div className="app-grid">
        {APPS.map((app) => (
          <div key={app.href} className="app-card">
            <h2>{app.title}</h2>
            <p className="muted">{app.description}</p>
            <a href={app.href} className="button">
              Open
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
