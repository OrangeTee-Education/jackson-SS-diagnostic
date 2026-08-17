import type { DiagnosticReport } from "../../shared/diagnostic";

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

export interface SessionSummary {
  id: string;
  student_name: string;
  status: "in_progress" | "evaluated";
  created_at: string;
}

export async function listSessions(): Promise<SessionSummary[]> {
  const data = await apiFetch<{ sessions: SessionSummary[] }>("/api/sessions");
  return data.sessions;
}

export interface SubmittedAnswer {
  number: number;
  title: string;
  prompt: string;
  answerText: string;
}

export async function createSession(studentName: string, answers: SubmittedAnswer[]): Promise<string> {
  const data = await apiFetch<{ id: string }>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ studentName, answers }),
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

export async function getSession(id: string): Promise<SessionDetail> {
  return apiFetch<SessionDetail>(`/api/sessions/${id}`);
}

export async function evaluateSession(id: string): Promise<ReportRow> {
  const data = await apiFetch<{ report: ReportRow }>(`/api/sessions/${id}/evaluate`, { method: "POST" });
  return data.report;
}
