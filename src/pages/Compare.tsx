import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getComparison, type ComparisonResult } from "../lib/api";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const student = searchParams.get("student") ?? "";
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    setResult(null);
    setError(null);
    getComparison(student)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load comparison."));
  }, [student]);

  if (!student) {
    return (
      <div className="page">
        <p className="error">No student specified.</p>
        <Link to="/social-studies">Back home</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{student} — Comparison Across Administrations</h1>
          <p className="muted">Same 24-question instrument, tracked by question over time.</p>
        </div>
        <div className="button-row no-print">
          <Link to="/social-studies" className="button secondary">
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
        <p className="muted">No sessions found for "{student}".</p>
      )}

      {result && result.sessions.length === 1 && (
        <p className="muted">
          Only one administration so far for {student}. Run the diagnostic again later to see a comparison.
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
                      <Link to={`/social-studies/sessions/${s.id}`}>
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
