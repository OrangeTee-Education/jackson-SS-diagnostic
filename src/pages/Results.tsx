import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession, type SessionDetail } from "../lib/api";
import { runEvaluation } from "../lib/runEvaluation";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reevaluating, setReevaluating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    getSession(id)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load session."));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReevaluate() {
    if (!id) return;
    setReevaluating(true);
    setError(null);
    try {
      await runEvaluation(id, setProgress);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      setReevaluating(false);
      setProgress(null);
    }
  }

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const { session, answers, report } = detail;
  const data = report?.report_json;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{session.student_name}</h1>
          <p className="muted">{new Date(session.created_at).toLocaleString()}</p>
        </div>
        <div className="button-row">
          <Link to="/" className="button secondary">
            Back
          </Link>
          <button onClick={handleReevaluate} disabled={reevaluating}>
            {reevaluating ? "Evaluating…" : report ? "Re-run evaluation" : "Run evaluation"}
          </button>
        </div>
      </header>

      {progress && <p className="muted">{progress}</p>}
      {!data && !reevaluating && <p className="muted">No evaluation yet.</p>}

      {data && (
        <>
          <Section title="1. Concept Map">
            <ConceptGroup label="Secure" items={data.concept_map.secure} tone="secure" />
            <ConceptGroup label="Partial" items={data.concept_map.partial} tone="partial" />
            <ConceptGroup label="Misconceptions" items={data.concept_map.misconceptions} tone="misconception" />
            <ConceptGroup label="Unknown / Missing" items={data.concept_map.unknown} tone="unknown" />
            <ConceptGroup
              label="Insufficient Evidence"
              items={data.concept_map.insufficient_evidence}
              tone="unknown"
            />
          </Section>

          <Section title="2. Domain-Level Interpretation">
            <div className="domain-grid">
              {data.domain_interpretation.map((d) => (
                <div className="domain-card" key={d.domain}>
                  <h3>{d.domain}</h3>
                  <p>{d.summary}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Most Important Misconceptions">
            {data.top_misconceptions.length === 0 && <p className="muted">None identified.</p>}
            <ol className="ranked-list">
              {data.top_misconceptions
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((m) => (
                  <li key={m.rank}>
                    <strong>{m.concept}</strong>
                    <p>{m.description}</p>
                    <p className="muted">Why it matters: {m.why_important}</p>
                  </li>
                ))}
            </ol>
          </Section>

          <Section title="4. Adaptive Follow-Up Probes">
            {data.followup_probes.length === 0 && (
              <p className="muted">No follow-up probes recommended right now.</p>
            )}
            <ul className="probe-list">
              {data.followup_probes.map((p, i) => (
                <li key={i}>
                  <span className="badge">{p.domain}</span>
                  <p className="probe-question">{p.question}</p>
                  <p className="muted">{p.purpose}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="5. Preliminary Instructional Implications">
            <SubList label="Teach first (prerequisites)" items={data.instructional_implications.prerequisites_first} />
            <SubList
              label="Little or no instruction needed"
              items={data.instructional_implications.little_or_no_instruction_needed}
            />
            <SubList
              label="Misconceptions to explicitly reconstruct"
              items={data.instructional_implications.misconceptions_to_reconstruct}
            />
            <SubList
              label="Needs further probing before deciding"
              items={data.instructional_implications.needs_further_probing_before_deciding}
            />
          </Section>

          <Section title="Per-Question Detail">
            <div className="table-scroll">
              <table className="per-question-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Class.</th>
                    <th>What it tells us</th>
                    <th>Concepts</th>
                    <th>Misconception</th>
                    <th>Follow-up?</th>
                  </tr>
                </thead>
                <tbody>
                  {data.per_question
                    .slice()
                    .sort((a, b) => a.question_number - b.question_number)
                    .map((pq) => (
                      <tr key={pq.question_number}>
                        <td>{pq.question_number}</td>
                        <td>
                          <span className={`tag tag-${pq.classification}`}>{pq.classification}</span>
                        </td>
                        <td>{pq.summary}</td>
                        <td>{pq.concepts_evidenced.join(", ")}</td>
                        <td>{pq.misconception_detail || "—"}</td>
                        <td>{pq.follow_up_warranted ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      <Section title="Raw Answers">
        <ol className="review-list">
          {answers.map((a) => (
            <li key={a.question_number}>
              <div className="review-question">
                <strong>
                  {a.question_number}. {a.question_title}
                </strong>
              </div>
              <p className="review-answer">{a.answer_text?.trim() || <em>No answer given</em>}</p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="report-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ConceptGroup({ label, items, tone }: { label: string; items: string[]; tone: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`concept-group concept-group-${tone}`}>
      <h4>{label}</h4>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SubList({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="sublist">
      <h4>{label}</h4>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
