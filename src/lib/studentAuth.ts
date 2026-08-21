export interface RememberedStudent {
  id: string;
  name: string;
  code: string;
}

const STORAGE_KEY = "orangetee_remembered_students";

export function listRememberedStudents(): RememberedStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRememberedStudent(studentId: string): RememberedStudent | null {
  return listRememberedStudents().find((s) => s.id === studentId) ?? null;
}

export function rememberStudent(student: RememberedStudent): void {
  const existing = listRememberedStudents().filter((s) => s.id !== student.id);
  existing.unshift(student);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function forgetStudent(studentId: string): void {
  const existing = listRememberedStudents().filter((s) => s.id !== studentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
