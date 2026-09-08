import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function PrintableLessonDoc({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <div className="button-row no-print">
        <Link to="/lessons" className="button secondary">
          ← Back to Lessons
        </Link>
        <button onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <header className="page-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </header>

      {children}
    </div>
  );
}
