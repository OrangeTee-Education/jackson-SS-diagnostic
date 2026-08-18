import { evaluateBatch, evaluateSummaryA, evaluateSummaryB, finalizeReport, type ReportRow } from "./api";

const TOTAL_QUESTIONS = 24;
const BATCH_SIZE = 4;

function withStepContext<T>(label: string, promise: Promise<T>): Promise<T> {
  return promise.catch((err) => {
    const message = err instanceof Error ? err.message : "unknown error";
    throw new Error(`${label} failed: ${message}`);
  });
}

// Grading is split into many small calls instead of one big one because
// Netlify's free-tier functions hard-timeout at 10 seconds, and a single
// call covering all 24 questions (or the full five-part summary) reliably
// takes longer than that.
export async function runEvaluation(sessionId: string, onProgress: (message: string) => void): Promise<ReportRow> {
  for (let start = 1; start <= TOTAL_QUESTIONS; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL_QUESTIONS);
    const label = `Grading questions ${start}-${end} of ${TOTAL_QUESTIONS}`;
    onProgress(`${label}…`);
    const questionNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    await withStepContext(label, evaluateBatch(sessionId, questionNumbers));
  }

  onProgress("Summarizing concept map and domains…");
  const partA = await withStepContext("Summarizing concept map and domains", evaluateSummaryA(sessionId));

  onProgress("Summarizing misconceptions and instructional plan…");
  const partB = await withStepContext(
    "Summarizing misconceptions and instructional plan",
    evaluateSummaryB(sessionId)
  );

  onProgress("Finishing up…");
  return withStepContext(
    "Finishing up",
    finalizeReport(sessionId, {
      conceptMap: partA.concept_map,
      domainInterpretation: partA.domain_interpretation,
      topMisconceptions: partB.top_misconceptions,
      followupProbes: partB.followup_probes,
      instructionalImplications: partB.instructional_implications,
    })
  );
}
