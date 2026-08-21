import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { listSessions, type SessionSummary } from "../lib/api";
import { getRememberedStudent } from "../lib/studentAuth";

export default function StudentHome() {
  const { studentId } = useParams<{ studentId: string }>();
  const remembered = studentId ? getRememberedStudent(studentId) : null;

  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !remembered) return;
    listSessions(studentId, remembered.code)
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load sessions."));
  }, [studentId, remembered?.code]);

  if (!studentId || !remembered) {
    return <Navigate to="/social-studies" replace />;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/social-studies" className="back-link">
            ← Switch student
          </Link>
          <h1>{remembered.name}</h1>
        </div>
        <div className="button-row">
          <Link to={`/social-studies/students/${studentId}/new`} className="button">
            + New Diagnostic Session
          </Link>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {sessions === null && !error && <p className="muted">Loading…</p>}
      {sessions && sessions.length === 0 && (
        <p className="muted">No sessions yet. Start a new diagnostic session above.</p>
      )}

      {sessions && sessions.length > 0 && (
        <section className="report-section">
          <div className="page-header">
            <h2>Sessions</h2>
            {sessions.length > 1 && (
              <Link to={`/social-studies/students/${studentId}/compare`} className="button secondary">
                Compare {sessions.length} administrations
              </Link>
            )}
          </div>
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link to={`/social-studies/students/${studentId}/sessions/${s.id}`}>
                  <span className={`badge badge-${s.status}`}>
                    {s.status === "evaluated" ? "Evaluated" : "In progress"}
                  </span>
                  <span className="session-date">{new Date(s.created_at).toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
