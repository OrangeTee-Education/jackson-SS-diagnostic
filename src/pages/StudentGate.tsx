import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, createStudent, loginStudent } from "../lib/api";
import { forgetStudent, listRememberedStudents, rememberStudent } from "../lib/studentAuth";

export default function StudentGate() {
  const navigate = useNavigate();
  const [remembered, setRemembered] = useState(listRememberedStudents());

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<{ id: string; name: string; access_code: string } | null>(null);

  async function handleUnlock() {
    if (!code.trim()) return;
    setCheckingCode(true);
    setCodeError(null);
    try {
      const { student, code: normalizedCode } = await loginStudent(code.trim());
      rememberStudent({ id: student.id, name: student.name, code: normalizedCode });
      navigate(`/social-studies/students/${student.id}`);
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : "Could not check that code.");
    } finally {
      setCheckingCode(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const student = await createStudent(newName.trim());
      setNewStudent(student);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Could not create student.");
    } finally {
      setCreating(false);
    }
  }

  function handleForget(id: string) {
    forgetStudent(id);
    setRemembered(listRememberedStudents());
  }

  function continueAsNewStudent() {
    if (!newStudent) return;
    rememberStudent({ id: newStudent.id, name: newStudent.name, code: newStudent.access_code });
    navigate(`/social-studies/students/${newStudent.id}`);
  }

  if (newStudent) {
    return (
      <div className="page">
        <div className="card">
          <h1>{newStudent.name}'s access code</h1>
          <p className="muted">
            Save this code — it's the only way to see {newStudent.name}'s sessions and results later, including
            from a different device or browser.
          </p>
          <p className="access-code-display">{newStudent.access_code}</p>
          <div className="button-row">
            <button onClick={continueAsNewStudent}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← OrangeTee Labs
          </Link>
          <h1>Social Studies Diagnostic</h1>
          <p className="muted">Each student's sessions are private to their access code.</p>
        </div>
      </header>

      {remembered.length > 0 && (
        <section className="report-section">
          <h2>Continue</h2>
          <ul className="session-list">
            {remembered.map((s) => (
              <li key={s.id} className="remembered-student-row">
                <Link to={`/social-studies/students/${s.id}`} className="remembered-student-link">
                  <span className="session-name">{s.name}</span>
                </Link>
                <button className="link-button" onClick={() => handleForget(s.id)}>
                  Forget
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="report-section">
        <h2>Have an access code?</h2>
        <label className="field">
          Access code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUnlock();
            }}
            placeholder="e.g. AB3CD9"
            autoCapitalize="characters"
          />
        </label>
        {codeError && <p className="error">{codeError}</p>}
        <div className="button-row">
          <button onClick={handleUnlock} disabled={checkingCode || !code.trim()}>
            {checkingCode ? "Checking…" : "Unlock"}
          </button>
        </div>
      </section>

      <section className="report-section">
        <h2>New student</h2>
        <p className="muted">Set up a new student and get their access code.</p>
        <label className="field">
          Student name
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Student's name"
          />
        </label>
        {createError && <p className="error">{createError}</p>}
        <div className="button-row">
          <button className="secondary" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? "Creating…" : "Create student"}
          </button>
        </div>
      </section>
    </div>
  );
}
