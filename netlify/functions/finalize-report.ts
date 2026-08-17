import type { Config, Context } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { fetchGradedQuestions } from "../lib/gradedQuestions";
import type {
  ConceptMap,
  DomainInterpretation,
  RankedMisconception,
  FollowUpProbe,
  InstructionalImplications,
  DiagnosticReport,
} from "../../shared/diagnostic";

interface FinalizeBody {
  conceptMap: ConceptMap;
  domainInterpretation: DomainInterpretation[];
  topMisconceptions: RankedMisconception[];
  followupProbes: FollowUpProbe[];
  instructionalImplications: InstructionalImplications;
}

const MODEL_LABEL = "claude-haiku-4-5-20251001 (batched)";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const id = context.params.id;
  if (!id) return json({ error: "Missing session id." }, 400);

  let body: FinalizeBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  let graded;
  try {
    graded = await fetchGradedQuestions(supabase, id);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Could not load graded questions." }, 400);
  }

  const report: DiagnosticReport = {
    per_question: graded,
    concept_map: body.conceptMap,
    domain_interpretation: body.domainInterpretation,
    top_misconceptions: body.topMisconceptions,
    followup_probes: body.followupProbes,
    instructional_implications: body.instructionalImplications,
  };

  const { data: savedReport, error: saveError } = await supabase
    .from("reports")
    .upsert({ session_id: id, model: MODEL_LABEL, report_json: report }, { onConflict: "session_id" })
    .select("*")
    .single();

  if (saveError) return json({ error: saveError.message }, 500);

  await supabase.from("sessions").update({ status: "evaluated" }).eq("id", id);

  return json({ report: savedReport });
};

export const config: Config = { path: "/api/sessions/:id/finalize-report" };
