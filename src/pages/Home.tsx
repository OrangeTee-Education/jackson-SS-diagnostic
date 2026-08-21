import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSessions, type SessionSummary } from "../lib/api";

function groupByStudent(sessions: SessionSummary[]): Array<[string, SessionSummary[]]> {
  const groups = new Map<string, SessionSummary[]>();
  for (const s of sessions) {
    const list = groups.get(s.student_name) ?? [];
    list.push(s);
    groups.set(s.student_name, list);
  }
  return Array.from(groups.entries());
}

export default function Home() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load sessions."));
  }, []);

  const groups = sessions ? groupByStudent(sessions) : [];

  return (
    <div className="page">
      <header className="page-header">
        <h1>Jackson Social Studies Diagnostic</h1>
        <div className="button-row">
          <Link to="/new" className="button">
            + New Diagnostic Session
          </Link>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {sessions === null && !error && <p className="muted">Loading…</p>}
      {sessions && sessions.length === 0 && (
        <p className="muted">No sessions yet. Start a new diagnostic session above.</p>
      )}

      {groups.map(([studentName, studentSessions]) => (
        <section key={studentName} className="report-section">
          <div className="page-header">
            <h2>{studentName}</h2>
            {studentSessions.length > 1 && (
              <Link to={`/compare?student=${encodeURIComponent(studentName)}`} className="button secondary">
                Compare {studentSessions.length} administrations
              </Link>
            )}
          </div>
          <ul className="session-list">
            {studentSessions.map((s) => (
              <li key={s.id}>
                <Link to={`/sessions/${s.id}`}>
                  <span className="session-name">{s.student_name}</span>
                  <span className={`badge badge-${s.status}`}>
                    {s.status === "evaluated" ? "Evaluated" : "In progress"}
                  </span>
                  <span className="session-date">{new Date(s.created_at).toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
