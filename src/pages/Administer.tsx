import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QUESTIONS } from "../../shared/diagnostic";
import { ApiError, createSession, evaluateSession } from "../lib/api";

export default function Administer() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("Jackson");
  const [answers, setAnswers] = useState<string[]>(() => Array(QUESTIONS.length).fill(""));
  const [step, setStep] = useState(0); // 0 = intro, 1..24 = questions, 25 = review
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = QUESTIONS.length;

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = QUESTIONS.map((q, i) => ({
        number: q.number,
        title: q.title,
        prompt: q.prompt,
        answerText: answers[i],
      }));
      const id = await createSession(studentName, payload);
      await evaluateSession(id);
      navigate(`/sessions/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong submitting the diagnostic.");
      setSubmitting(false);
    }
  }

  if (step === 0) {
    return (
      <div className="page">
        <div className="card">
          <h1>New Diagnostic Session</h1>
          <label className="field">
            Student name
            <input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          </label>
          <p className="muted">
            You'll go through {totalSteps} questions one at a time. Type the answer as close to verbatim as
            possible — awkward wording is fine. You can go back and edit any answer before submitting.
          </p>
          <div className="button-row">
            <button onClick={() => setStep(1)} disabled={!studentName.trim()}>
              Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step >= 1 && step <= totalSteps) {
    const q = QUESTIONS[step - 1];
    return (
      <div className="page">
        <div className="progress">
          <span>
            Question {step} of {totalSteps}
          </span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>
        <div className="card">
          <h2>
            {q.number}. {q.title}
          </h2>
          <p className="question-prompt">{q.prompt}</p>
          <textarea
            autoFocus
            rows={8}
            value={answers[step - 1]}
            onChange={(e) => updateAnswer(step - 1, e.target.value)}
            placeholder="Type the answer as close to verbatim as possible…"
          />
          <div className="button-row">
            <button className="secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
            <button onClick={() => setStep(step + 1)}>{step === totalSteps ? "Review" : "Next"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Review — {studentName}</h1>
        <p className="muted">Confirm the answers below, then submit for evaluation.</p>
        <ol className="review-list">
          {QUESTIONS.map((q, i) => (
            <li key={q.number}>
              <div className="review-question">
                <strong>
                  {q.number}. {q.title}
                </strong>
                <button className="link-button" onClick={() => setStep(q.number)}>
                  Edit
                </button>
              </div>
              <p className="review-answer">{answers[i]?.trim() || <em>No answer given</em>}</p>
            </li>
          ))}
        </ol>
        {error && <p className="error">{error}</p>}
        <div className="button-row">
          <button className="secondary" onClick={() => setStep(totalSteps)} disabled={submitting}>
            Back
          </button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Evaluating… this can take up to a minute" : "Submit for Evaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}
