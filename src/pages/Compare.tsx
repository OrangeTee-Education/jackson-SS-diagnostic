import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getComparison, type ComparisonResult } from "../lib/api";
import { getRememberedStudent } from "../lib/studentAuth";

export default function Compare() {
  const { studentId } = useParams<{ studentId: string }>();
  const remembered = studentId ? getRememberedStudent(studentId) : null;

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !remembered) return;
    setResult(null);
    setError(null);
    getComparison(studentId, remembered.code)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load comparison."));
  }, [studentId, remembered?.code]);

  if (!studentId || !remembered) {
    return <Navigate to="/social-studies" replace />;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{remembered.name} — Comparison Across Administrations</h1>
          <p className="muted">Same 24-question instrument, tracked by question over time.</p>
        </div>
        <div className="button-row no-print">
          <Link to={`/social-studies/students/${studentId}`} className="button secondary">
            Back
          </Link>
          {result && result.sessions.length > 0 && (
            <button className="secondary" onClick={() => window.print()}>
              Print / Save as PDF
            </button>
          )}
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {!result && !error && <p className="muted">Loading…</p>}

      {result && result.sessions.length === 0 && (
        <p className="muted">No sessions found for "{remembered.name}".</p>
      )}

      {result && result.sessions.length === 1 && (
        <p className="muted">
          Only one administration so far for {remembered.name}. Run the diagnostic again later to see a comparison.
        </p>
      )}

      {result && result.sessions.length > 0 && (
        <section className="report-section">
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  {result.sessions.map((s) => (
                    <th key={s.id}>
                      <Link to={`/social-studies/students/${studentId}/sessions/${s.id}`}>
                        {new Date(s.created_at).toLocaleDateString()}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.question_number}>
                    <td>{row.question_number}</td>
                    <td>{row.question_title}</td>
                    {row.cells.map((cell, i) => (
                      <td key={result.sessions[i].id}>
                        {cell ? (
                          <span className={`tag tag-${cell.classification}`} title={cell.summary}>
                            {cell.classification}
                          </span>
                        ) : (
                          <span className="compare-cell-empty">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
