import type {
  ConceptMap,
  DiagnosticReport,
  DomainInterpretation,
  FollowUpProbe,
  InstructionalImplications,
  PerQuestionEvaluation,
  RankedMisconception,
} from "../../shared/diagnostic";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError((data as { error?: string })?.error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

function authHeaders(code: string): Record<string, string> {
  return { "x-access-code": code };
}

export interface Student {
  id: string;
  name: string;
}

export async function createStudent(name: string): Promise<Student & { access_code: string }> {
  const data = await apiFetch<{ student: Student & { access_code: string } }>("/api/students", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data.student;
}

export async function loginStudent(code: string): Promise<{ student: Student; code: string }> {
  return apiFetch<{ student: Student; code: string }>("/api/student-login", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export interface SessionSummary {
  id: string;
  student_name: string;
  status: "in_progress" | "evaluated";
  created_at: string;
}

export async function listSessions(studentId: string, code: string): Promise<SessionSummary[]> {
  const data = await apiFetch<{ sessions: SessionSummary[] }>(
    `/api/sessions?studentId=${encodeURIComponent(studentId)}`,
    { headers: authHeaders(code) }
  );
  return data.sessions;
}

export interface SubmittedAnswer {
  number: number;
  title: string;
  prompt: string;
  answerText: string;
}

export async function createSession(
  studentId: string,
  code: string,
  answers: SubmittedAnswer[]
): Promise<string> {
  const data = await apiFetch<{ id: string }>("/api/sessions", {
    method: "POST",
    headers: authHeaders(code),
    body: JSON.stringify({ studentId, answers }),
  });
  return data.id;
}

export interface AnswerRow {
  id: string;
  session_id: string;
  question_number: number;
  question_title: string;
  question_prompt: string;
  answer_text: string;
}

export interface ReportRow {
  id: string;
  session_id: string;
  model: string;
  report_json: DiagnosticReport;
  created_at: string;
}

export interface SessionDetail {
  session: SessionSummary;
  answers: AnswerRow[];
  report: ReportRow | null;
}

export async function getSession(id: string, code: string): Promise<SessionDetail> {
  return apiFetch<SessionDetail>(`/api/sessions/${id}`, { headers: authHeaders(code) });
}

export async function evaluateBatch(
  id: string,
  code: string,
  questionNumbers: number[]
): Promise<PerQuestionEvaluation[]> {
  const data = await apiFetch<{ evaluations: PerQuestionEvaluation[] }>(`/api/sessions/${id}/evaluate-batch`, {
    method: "POST",
    headers: authHeaders(code),
    body: JSON.stringify({ questionNumbers }),
  });
  return data.evaluations;
}

export interface SummaryAResult {
  concept_map: ConceptMap;
  domain_interpretation: DomainInterpretation[];
}

export async function evaluateSummaryA(id: string, code: string): Promise<SummaryAResult> {
  return apiFetch<SummaryAResult>(`/api/sessions/${id}/evaluate-summary-a`, {
    method: "POST",
    headers: authHeaders(code),
  });
}

export interface SummaryBResult {
  top_misconceptions: RankedMisconception[];
  followup_probes: FollowUpProbe[];
  instructional_implications: InstructionalImplications;
}

export async function evaluateSummaryB(id: string, code: string): Promise<SummaryBResult> {
  return apiFetch<SummaryBResult>(`/api/sessions/${id}/evaluate-summary-b`, {
    method: "POST",
    headers: authHeaders(code),
  });
}

export interface ComparisonSession {
  id: string;
  created_at: string;
  status: "in_progress" | "evaluated";
}

export interface ComparisonCell {
  session_id: string;
  classification: "S" | "P" | "M" | "U";
  summary: string;
}

export interface ComparisonRow {
  question_number: number;
  question_title: string;
  cells: Array<ComparisonCell | null>;
}

export interface ComparisonResult {
  student: string;
  sessions: ComparisonSession[];
  rows: ComparisonRow[];
}

export async function getComparison(studentId: string, code: string): Promise<ComparisonResult> {
  return apiFetch<ComparisonResult>(`/api/compare?studentId=${encodeURIComponent(studentId)}`, {
    headers: authHeaders(code),
  });
}

export async function finalizeReport(
  id: string,
  code: string,
  parts: {
    conceptMap: ConceptMap;
    domainInterpretation: DomainInterpretation[];
    topMisconceptions: RankedMisconception[];
    followupProbes: FollowUpProbe[];
    instructionalImplications: InstructionalImplications;
  }
): Promise<ReportRow> {
  const data = await apiFetch<{ report: ReportRow }>(`/api/sessions/${id}/finalize-report`, {
    method: "POST",
    headers: authHeaders(code),
    body: JSON.stringify(parts),
  });
  return data.report;
}
