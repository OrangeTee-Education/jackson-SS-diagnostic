import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSessions, type SessionSummary } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Home() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load sessions."));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Jackson Social Studies Diagnostic</h1>
        <div className="button-row">
          <Link to="/new" className="button">
            + New Diagnostic Session
          </Link>
          <button className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {sessions === null && !error && <p className="muted">Loading…</p>}
      {sessions && sessions.length === 0 && (
        <p className="muted">No sessions yet. Start a new diagnostic session above.</p>
      )}

      {sessions && sessions.length > 0 && (
        <ul className="session-list">
          {sessions.map((s) => (
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
      )}
    </div>
  );
}
