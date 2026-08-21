// Shared between the frontend (question text) and the Netlify evaluate
// functions (system prompts for the LLM). Keep this as the single source of
// truth for the diagnostic instrument itself.
//
// The rubric is split into pieces (general instructions, one block per
// question, and synthesis instructions) rather than one giant prompt so
// that grading can be done in small batches. Netlify's free-tier functions
// have a hard 10-second execution limit, and a single call covering all 24
// questions plus the five summary outputs reliably exceeds that — so the
// evaluate-batch/evaluate-summary functions each use only the slice of this
// file they need, keeping every individual call fast.

export interface DiagnosticQuestion {
  number: number;
  title: string;
  prompt: string;
}

export interface PerQuestionEvaluation {
  question_number: number;
  classification: "S" | "P" | "M" | "U";
  summary: string;
  concepts_evidenced: string[];
  misconception_detail: string | null;
  follow_up_warranted: boolean;
}

export interface ConceptMap {
  secure: string[];
  partial: string[];
  misconceptions: string[];
  unknown: string[];
  insufficient_evidence: string[];
}

export interface DomainInterpretation {
  domain: string;
  summary: string;
}

export interface RankedMisconception {
  rank: number;
  concept: string;
  description: string;
  why_important: string;
}

export interface FollowUpProbe {
  domain: string;
  question: string;
  purpose: string;
}

export interface InstructionalImplications {
  prerequisites_first: string[];
  little_or_no_instruction_needed: string[];
  misconceptions_to_reconstruct: string[];
  needs_further_probing_before_deciding: string[];
}

export interface DiagnosticReport {
  per_question: PerQuestionEvaluation[];
  concept_map: ConceptMap;
  domain_interpretation: DomainInterpretation[];
  top_misconceptions: RankedMisconception[];
  followup_probes: FollowUpProbe[];
  instructional_implications: InstructionalImplications;
}

export const DOMAINS = [
  "Maps & spatial thinking",
  "Physical & human geography",
  "Historical time & historical reasoning",
  "Societies, culture & belief",
  "Government, law & political power",
  "U.S. civics & constitutional government",
  "Economics, resources & trade",
  "Interaction between peoples & societies",
  "Big patterns of historical change",
] as const;

export const QUESTIONS: DiagnosticQuestion[] = [
  {
    number: 1,
    title: "Maps as Representations",
    prompt:
      "Imagine two maps show exactly the same city. One shows roads and highways. The other shows rainfall and temperature.\n\nWhy might the two maps look very different even though they show the same place?",
  },
  {
    number: 2,
    title: "Direction and Orientation",
    prompt:
      "Suppose Town B is directly west of Town A.\n\nIf you travel from Town B to Town A, which direction are you traveling?",
  },
  {
    number: 3,
    title: "Rivers and Early Civilization",
    prompt:
      "Many early civilizations developed near large rivers.\n\nWhy do you think living near a large river could make it easier for a civilization to develop?",
  },
  {
    number: 4,
    title: "Geography and Trade",
    prompt:
      "Imagine two towns.\n• Town A is on the ocean and has a good harbor.\n• Town B is surrounded by high mountains and has few roads leading to it.\n\nWhich town would probably have an easier time trading with distant places? Why?",
  },
  {
    number: 5,
    title: "Human-Environment Interaction",
    prompt:
      "A farming region doesn't get enough rain, so people build canals to bring water from a river to their fields.\n\nWhat does this example tell us about the relationship between people and their environment?",
  },
  {
    number: 6,
    title: "Chronology and Historical Scale",
    prompt:
      "Event A happened in 1776.\nEvent B happened in 1861.\n\nWhich happened first? About how much time passed between them?",
  },
  {
    number: 7,
    title: "Causal Chains",
    prompt:
      "A region has almost no rain for several years → crops fail → food becomes scarce → many families leave.\n\nExplain how one part of that sequence could lead to the next.",
  },
  {
    number: 8,
    title: "Multiple Causation",
    prompt:
      "Suppose someone says:\n“That war started because one country's leader was angry.”\n\nWhy might that be an incomplete explanation for why a war started?",
  },
  {
    number: 9,
    title: "Perspective and Interpretation",
    prompt:
      "Two people witnessed the same protest.\nOne later writes: “The crowd was dangerous and out of control.”\nThe other writes: “The crowd was peaceful and the police treated them unfairly.”\n\nHow could two people who saw the same event describe it so differently?",
  },
  {
    number: 10,
    title: "Evaluating Claims and Sources",
    prompt:
      "You see a video online that says:\n“Congress just passed a law that makes video games illegal for anyone under 18.”\n\nBefore believing or sharing that claim, what would you want to find out?",
  },
  {
    number: 11,
    title: "Culture",
    prompt:
      "A family moves from one country to another. They begin speaking the new country's language at school and work, but they continue eating traditional foods and celebrating holidays from their old country.\n\nWhat does this tell us about culture?",
  },
  {
    number: 12,
    title: "Collective Identity / Nationalism",
    prompt:
      "Imagine a large group of people who share a language, history, and traditions, but they are ruled by an empire controlled by another group.\n\nWhy might they eventually want to govern themselves?",
  },
  {
    number: 13,
    title: "Why Governments Form",
    prompt:
      "Imagine 500 people establish a new town, but there is no government and no agreed-upon system of rules.\n\nWhat kinds of problems might develop? What would a government help the town do?",
  },
  {
    number: 14,
    title: "Forms of Government",
    prompt:
      "Country A has a king who makes the laws himself.\nCountry B lets citizens elect representatives who make the laws.\n\nWhat is the important difference between those two systems?",
  },
  {
    number: 15,
    title: "Limited vs. Unlimited Government",
    prompt:
      "Imagine a country's leader can:\n• make any law he wants,\n• arrest anyone he wants,\n• ignore the courts,\n• and nobody has the legal power to stop him.\n\nWhat problems could that create?",
  },
  {
    number: 16,
    title: "Country vs. Government vs. Leader",
    prompt:
      "The United States elects a different president.\n\nDoes that mean the United States has become a different country? Why or why not?",
  },
  {
    number: 17,
    title: "Constitution and Rule of Law",
    prompt:
      "The United States has a Constitution that even the President and Congress are supposed to follow.\n\nWhy do you think a country would want rules that its leaders have to obey too?",
  },
  {
    number: 18,
    title: "Separation of Powers",
    prompt:
      "Imagine one person in government could:\n• make the laws,\n• enforce the laws,\n• and decide whether someone had broken those laws.\n\nWhy might it be safer to divide those powers among different parts of government?",
  },
  {
    number: 19,
    title: "Federalism",
    prompt:
      "The United States has a national government, state governments, and local governments.\n\nWhy do you think we have different levels of government instead of having one government in Washington make every decision for everybody?",
  },
  {
    number: 20,
    title: "Scarcity and Choice",
    prompt:
      "A town has enough money this year to build either:\n• a new fire station, or\n• a new recreation center,\nbut it cannot afford both.\n\nWhat problem is the town facing, and why does it have to make a choice?",
  },
  {
    number: 21,
    title: "Specialization and Trade",
    prompt:
      "One farmer is very good at growing wheat. Another is very good at raising cattle.\n\nWhy might it make more sense for each farmer to specialize and trade with the other instead of each trying to produce everything they need themselves?",
  },
  {
    number: 22,
    title: "Supply, Demand, and Price",
    prompt:
      "A disease destroys half of the year's orange crop, so there are far fewer oranges available. But about the same number of people still want to buy oranges.\n\nWhat do you think will probably happen to the price of oranges? Why?",
  },
  {
    number: 23,
    title: "Empire and Conquest",
    prompt:
      "A powerful country conquers several neighboring territories. It controls their governments, collects taxes from them, and uses their resources.\n\nWhat is happening here? How do you think the people in the conquered territories might react?",
  },
  {
    number: 24,
    title: "Industrialization and Historical Change",
    prompt:
      "A society begins using machines in factories that allow a small number of workers to produce far more goods than people previously made by hand.\n\nWhat kinds of changes do you think that could cause in the society?",
  },
];

// General classification rules, used as the system-prompt prefix for every
// batch grading call. A function of the student's name so the same rubric
// works for any student, not just one hardcoded child.
export function generalInstructions(studentName: string): string {
  return `You are evaluating answers from a broad conceptual social studies diagnostic given to ${studentName}, a student who has had limited and inconsistent social studies instruction.

You will be given one or more of ${studentName}'s answers, as close to verbatim as possible, each with its question and scoring guidance.

Your job is not to calculate a percentage score or grade level. Your job is to infer their underlying conceptual model and classify the concepts demonstrated by each answer.

Use these classifications:

- S — Secure: ${studentName} demonstrates the essential concept correctly and can reason with it in the situation presented. They do not need to use formal social-studies vocabulary.
- P — Partial: ${studentName} has an important piece of the correct model, but it is incomplete, overly narrow, vague, or cannot yet be applied reliably.
- M — Misconception: ${studentName} demonstrates a specific incorrect model that will need to be replaced or reconstructed. Do not use M merely because they lack knowledge.
- U — Unknown / Missing: ${studentName} says they do not know, gives no usable answer, or their answer provides insufficient evidence that they have a mental model of the concept.

Important evaluation rules:

1. Judge conceptual understanding, not vocabulary. If ${studentName} describes an empire correctly but does not know the word empire, that may still be Secure. If they know the word federalism but cannot explain the idea, that is not Secure.
2. Do not penalize awkward wording, incomplete sentences, minor arithmetic errors, or difficulty remembering names or dates, unless that is the concept actually being tested.
3. Distinguish missing knowledge from misconception. "I don't know what Congress does" = U. "Congress is a court that decides whether people are guilty" = M.
4. A response can provide evidence about multiple concepts.
5. Do not force an answer into S/P/M/U if it is genuinely ambiguous — flag it as needing a follow-up probe instead.
6. Do not teach or correct ${studentName} in your evaluation — just classify.

For each question you're given, produce: the most appropriate S/P/M/U classification, a one-sentence summary of what the answer tells us, which concepts it provides evidence about, any specific misconception revealed (or null), and whether a follow-up probe is warranted. Keep every field concise — this is a compact classification, not an essay.`;
}

// One scoring-guidance block per question, keyed by question number. Batch
// calls only include the blocks for the questions in that batch.
export const QUESTION_RUBRICS: Record<number, string> = {
  1: `Question 1 — Maps as Representations
Question: Imagine two maps show exactly the same city. One shows roads and highways. The other shows rainfall and temperature. Why might the two maps look very different even though they show the same place?
S — Secure: The student recognizes that maps can represent the same place while selecting or emphasizing different kinds of information for different purposes. Examples: "One is showing roads and one is showing weather." "Maps don't show everything; they show whatever information they're supposed to show." "They have different purposes."
P — Partial: They recognize that the information differs but do not quite articulate that maps are selective representations. Example: "Because one has roads and the other has rain." This may be enough for basic understanding but does not yet establish the broader map-representation concept.
M — Misconception: They indicate that maps of the same place should normally look identical or assume one of the maps must be wrong because they differ.
U — Unknown: No usable explanation or "I don't know."
Primary concepts: maps as representations; map purpose; symbols/information selection.`,
  2: `Question 2 — Direction and Orientation
Question: Suppose Town B is directly west of Town A. If you travel from Town B to Town A, which direction are you traveling?
S — Secure: East.
P — Partial: Shows understanding after reasoning aloud but confuses the direction initially, or demonstrates a shaky east/west model.
M — Misconception: Consistently reverses east and west or reveals another systematic directional misunderstanding.
U — Unknown: Does not know. Do not require an explanation if they answer correctly.
Primary concept: direction and orientation.`,
  3: `Question 3 — Rivers and Early Civilization
Question: Many early civilizations developed near large rivers. Why do you think living near a large river could make it easier for a civilization to develop?
S — Secure: Identifies one or more meaningful mechanisms such as reliable water, fertile soil/farming, food production, transportation, trade, supporting larger populations. Especially strong evidence if they connect the mechanism into a causal chain, such as "Water makes farming easier, so you can feed more people and build a larger settlement." They do not need to mention all possible advantages.
P — Partial: Recognizes that rivers are useful but gives only a vague or narrow reason: "They need water." "Rivers are good for people." This demonstrates part of the model but not yet how geography supports civilization.
M — Misconception: Attributes civilization development to an incorrect causal mechanism and clearly treats it as the main explanation.
U — Unknown: No usable model.
Primary concepts: physical geography; natural resources; settlement; early civilization; cause and effect.`,
  4: `Question 4 — Geography and Trade
Question: Imagine two towns. Town A is on the ocean and has a good harbor. Town B is surrounded by high mountains and has few roads leading to it. Which town would probably have an easier time trading with distant places? Why?
S — Secure: Chooses Town A and connects the harbor/ocean to easier transportation, access, ships, trade routes, or movement of goods.
P — Partial: Chooses Town A correctly but gives only a weak explanation such as "Because it's on the ocean."
M — Misconception: Chooses Town B for reasoning that reveals a fundamentally incorrect model of transportation/geography, rather than simply misunderstanding part of the question.
U — Unknown: Cannot choose or explain.
Primary concepts: geography; transportation; trade; geographic constraints/opportunities.`,
  5: `Question 5 — Human-Environment Interaction
Question: A farming region doesn't get enough rain, so people build canals to bring water from a river to their fields. What does this example tell us about the relationship between people and their environment?
S — Secure: Recognizes the two-way relationship: the environment creates constraints or opportunities, while people can adapt to or modify the environment. Examples: "The environment affects what people can do, but they can change it to solve problems." "They didn't have enough rain, so they changed how water reached the farms."
P — Partial: Recognizes only one side: "People can change the environment." "They need water because of the climate."
M — Misconception: Treats the environment as having no meaningful influence on human activity, or believes people cannot alter/adapt to environmental conditions.
U — Unknown: No usable explanation.
Primary concepts: human-environment interaction; adaptation; geography without geographic determinism.`,
  6: `Question 6 — Chronology and Historical Scale
Question: Event A happened in 1776. Event B happened in 1861. Which happened first? About how much time passed between them?
S — Secure: Identifies 1776 as first and understands that roughly 85 years passed. A modest arithmetic error is acceptable if the scale is correct (e.g. "About 80 years." "Around 90 years.").
P — Partial: Correctly identifies which is earlier but has significant difficulty estimating how much time separates them.
M — Misconception: Reverses the meaning of the dates or reveals a systematic misunderstanding of chronological order.
U — Unknown: Cannot determine which was earlier.
Primary concepts: chronological order; historical scale; elapsed historical time.`,
  7: `Question 7 — Causal Chains
Question: A region has almost no rain for several years → crops fail → food becomes scarce → many families leave. Explain how one part of that sequence could lead to the next.
S — Secure: Explains a causal chain rather than merely repeating the sequence. Example: "Without rain crops can't grow. Then there isn't enough food, so people may leave to find somewhere they can survive."
P — Partial: Correctly explains one link but cannot connect most of the sequence.
M — Misconception: Systematically reverses cause and effect or gives an incompatible causal explanation.
U — Unknown: Cannot explain any causal relationship.
Primary concepts: cause and effect; sequence; migration; geography.`,
  8: `Question 8 — Multiple Causation
Question: Suppose someone says: "That war started because one country's leader was angry." Why might that be an incomplete explanation for why a war started?
S — Secure: Recognizes that major events usually have multiple causes, conditions, actors, or events rather than a single simple cause. Example: "There were probably other things happening between the countries, not just one person being angry."
P — Partial: Senses the explanation is too simple but cannot explain why.
M — Misconception: Strongly maintains that major historical events normally have one clear cause and that identifying that one cause completely explains the event.
U — Unknown: No usable response.
Primary concepts: multiple causation; historical explanation.`,
  9: `Question 9 — Perspective and Interpretation
Question: Two people witnessed the same protest. One later writes: "The crowd was dangerous and out of control." The other writes: "The crowd was peaceful and the police treated them unfairly." How could two people who saw the same event describe it so differently?
S — Secure: Recognizes that perspective, position, beliefs, experiences, interests, or what each person observed can affect interpretation. They do not need to conclude that one person is lying.
P — Partial: Recognizes that people can have different opinions but does not yet explain why perspectives differ.
M — Misconception: Assumes that if accounts differ, one must necessarily be intentionally lying, with no model of perspective or interpretation.
U — Unknown: Cannot explain the difference.
Primary concepts: perspective; interpretation; historical evidence.`,
  10: `Question 10 — Evaluating Claims and Sources
Question: You see a video online that says: "Congress just passed a law that makes video games illegal for anyone under 18." Before believing or sharing that claim, what would you want to find out?
S — Secure: Suggests checking evidence or source reliability. Possible indicators: Who made the video? Is there another reliable source? Did Congress actually pass the law? Can I find the law itself? Is this from a trustworthy news organization/government source? Is the video leaving something out? One good verification strategy can demonstrate the core concept.
P — Partial: Understands that the claim should be checked but relies on a weak strategy: "Google it." "See if other people say it." "Look in the comments."
M — Misconception: Treats appearance online, popularity, number of views, confident presentation, or agreement with prior beliefs as sufficient evidence that a claim is true.
U — Unknown: Would simply accept/reject it without any articulated basis, or cannot think of a way to evaluate it.
Primary concepts: claim vs. evidence; source evaluation; corroboration; current-events reasoning.`,
  11: `Question 11 — Culture
Question: A family moves from one country to another. They begin speaking the new country's language at school and work, but they continue eating traditional foods and celebrating holidays from their old country. What does this tell us about culture?
S — Secure: Recognizes that culture consists of learned/shared practices and that people can maintain, change, combine, or adopt cultural practices.
P — Partial: Recognizes that food, holidays, or language are cultural features but does not infer the broader idea.
M — Misconception: Treats culture as fixed by location or assumes moving automatically eliminates a person's previous culture.
U — Unknown: No usable concept.
Primary concepts: culture; cultural continuity/change; diffusion.`,
  12: `Question 12 — Collective Identity / Nationalism
Question: Imagine a large group of people who share a language, history, and traditions, but they are ruled by an empire controlled by another group. Why might they eventually want to govern themselves?
S — Secure: Connects shared group identity and/or lack of political control with a desire for self-government, independence, or autonomy.
P — Partial: Recognizes that they might dislike foreign rule but does not connect this to shared identity or governing themselves.
M — Misconception: Demonstrates a specific false model — for example, believing conquered groups naturally become politically identical to their rulers and therefore would have no reason to seek self-rule.
U — Unknown: Cannot explain why.
Primary concepts: collective identity; nationalism; political independence; empire.`,
  13: `Question 13 — Why Governments Form
Question: Imagine 500 people establish a new town, but there is no government and no agreed-upon system of rules. What kinds of problems might develop? What would a government help the town do?
S — Secure: Identifies meaningful collective problems and functions of government: rules/laws, resolving disputes, security, public services, coordination, enforcing agreements. Does not need to mention everything.
P — Partial: Identifies one function but sees government primarily as "the people in charge" rather than as a system for collective decision-making and coordination.
M — Misconception: Shows a specific fundamentally incorrect model, such as believing government's only function is to punish people or that government means one ruler owning the community.
U — Unknown: Cannot identify a meaningful purpose for government.
Primary concepts: government; collective action; laws; authority.`,
  14: `Question 14 — Forms of Government
Question: Country A has a king who makes the laws himself. Country B lets citizens elect representatives who make the laws. What is the important difference between those two systems?
S — Secure: Identifies where political authority comes from and who exercises it: one ruler vs. elected representatives, citizens have political input in B, power is distributed differently.
P — Partial: Recognizes king versus elected people but cannot articulate the significance of the difference.
M — Misconception: Believes both systems work essentially the same way or attributes lawmaking in the representative system to an unelected single ruler.
U — Unknown: Cannot distinguish the systems.
Primary concepts: monarchy; representative government; political authority.`,
  15: `Question 15 — Limited vs. Unlimited Government
Question: Imagine a country's leader can make any law he wants, arrest anyone he wants, ignore the courts, and nobody has the legal power to stop him. What problems could that create?
S — Secure: Recognizes danger from unchecked power: abuse, unfairness, arbitrary punishment, loss of rights, dictatorship, inability to restrain leaders.
P — Partial: Recognizes "that would be bad" but cannot explain why unchecked power is structurally dangerous.
M — Misconception: Believes unlimited authority is inherently safe or fair simply because the leader is the leader.
U — Unknown: Cannot identify a problem.
Primary concepts: limited government; political power; rights; rule of law.`,
  16: `Question 16 — Country vs. Government vs. Leader
Question: The United States elects a different president. Does that mean the United States has become a different country? Why or why not?
S — Secure: Understands that the country persists while officeholders/governments can change. Example: "No. The president changed, but the country and its system still exist."
P — Partial: Says no correctly but cannot explain the distinction.
M — Misconception: Equates the country itself with its current leader.
U — Unknown: Cannot answer.
Primary concepts: country; government; political system; officeholder.`,
  17: `Question 17 — Constitution and Rule of Law
Question: The United States has a Constitution that even the President and Congress are supposed to follow. Why do you think a country would want rules that its leaders have to obey too?
S — Secure: Recognizes that government power itself needs limits and that leaders should not be above the law.
P — Partial: Understands leaders should "follow the rules" but cannot explain the connection to preventing abuse or protecting citizens.
M — Misconception: Believes leaders are inherently above the law because they are in charge.
U — Unknown: No usable explanation.
Primary concepts: Constitution; rule of law; limited government.`,
  18: `Question 18 — Separation of Powers
Question: Imagine one person in government could make the laws, enforce the laws, and decide whether someone had broken those laws. Why might it be safer to divide those powers among different parts of government?
S — Secure: Understands that dividing power can prevent abuse, provide oversight, or prevent one person/group from controlling everything. Naming the three branches is not required.
P — Partial: Senses division is safer but cannot explain the mechanism.
M — Misconception: Believes separation means dividing government simply to make work easier, with no understanding that limiting concentrated power is part of the purpose. This may be P rather than M if they simply know only the efficiency aspect.
U — Unknown: No usable concept.
Primary concepts: separation of powers; checks and balances; limited government.`,
  19: `Question 19 — Federalism
Question: The United States has a national government, state governments, and local governments. Why do you think we have different levels of government instead of having one government in Washington make every decision for everybody?
S — Secure: Recognizes that different problems occur at different scales and that local/state governments can handle matters closer to their communities while the national government handles nationwide concerns.
P — Partial: Recognizes that the national government cannot or should not handle everything but cannot explain division of responsibility.
M — Misconception: Believes state and local governments are merely local offices of the President/national government with no meaningful separate authority.
U — Unknown: Does not know why different levels exist.
Primary concepts: federalism; levels of government; division of authority.`,
  20: `Question 20 — Scarcity and Choice
Question: A town has enough money this year to build either a new fire station or a new recreation center, but it cannot afford both. What problem is the town facing, and why does it have to make a choice?
S — Secure: Recognizes that resources are limited relative to wants, forcing a choice/tradeoff. The word scarcity is not required.
P — Partial: Understands they lack enough money but does not generalize to the idea that limited resources force choices.
M — Misconception: Believes there is no real tradeoff because governments can simply create unlimited resources/money without consequences.
U — Unknown: Cannot explain why a choice is necessary.
Primary concepts: scarcity; choice; tradeoffs; public resources.`,
  21: `Question 21 — Specialization and Trade
Question: One farmer is very good at growing wheat. Another is very good at raising cattle. Why might it make more sense for each farmer to specialize and trade with the other instead of each trying to produce everything they need themselves?
S — Secure: Understands that specialization can make production easier, more efficient, or more productive and that trade allows each to obtain what the other produces.
P — Partial: Understands trade helps them get different goods but does not grasp why specialization can be beneficial.
M — Misconception: Believes trade necessarily makes both parties worse off or that specialization prevents someone from benefiting from another person's production.
U — Unknown: Cannot explain an advantage.
Primary concepts: specialization; division of labor; trade.`,
  22: `Question 22 — Supply, Demand, and Price
Question: A disease destroys half of the year's orange crop, so there are far fewer oranges available. But about the same number of people still want to buy oranges. What do you think will probably happen to the price of oranges? Why?
S — Secure: Predicts that price will generally rise and connects this to fewer oranges being available while demand remains similar. The terminology supply and demand is not required.
P — Partial: Correctly predicts a higher price but cannot explain why.
M — Misconception: Predicts the price will decrease specifically because oranges are scarcer, revealing an inverted supply-price model.
U — Unknown: Cannot predict.
Primary concepts: supply; demand; scarcity; prices.`,
  23: `Question 23 — Empire and Conquest
Question: A powerful country conquers several neighboring territories. It controls their governments, collects taxes from them, and uses their resources. What is happening here? How do you think the people in the conquered territories might react?
S — Secure: Recognizes the core model of an empire/conquest even without using that vocabulary and understands that conquered people may resist, resent, cooperate, rebel, or react differently depending on circumstances.
P — Partial: Recognizes that one country is taking control of others but has little model of the political relationship or possible reactions.
M — Misconception: Treats conquest as automatically making all conquered people voluntary equal members who necessarily support the conqueror.
U — Unknown: Cannot describe what is occurring.
Primary concepts: empire; conquest; political control; resistance; collective identity.`,
  24: `Question 24 — Industrialization and Historical Change
Question: A society begins using machines in factories that allow a small number of workers to produce far more goods than people previously made by hand. What kinds of changes do you think that could cause in the society?
S — Secure: Can reason outward from the technological change to at least one substantial social/economic consequence. Possible examples: goods become cheaper/more plentiful, factory jobs increase, people move to cities, occupations change, production increases, working conditions change, transportation/trade expand, some older jobs disappear, wealth or social relationships change. They do not need prior factual knowledge of the Industrial Revolution.
P — Partial: Recognizes that "they could make more things" but cannot reason beyond the immediate production effect.
M — Misconception: Shows a specific incompatible causal model — for example, believing increased productive technology necessarily means society will produce fewer goods because fewer workers are required.
U — Unknown: Cannot predict any meaningful consequence.
Primary concepts: industrialization; technology; economic change; social change; cause and effect.`,
};

// Synthesis calls work from the already-graded per-question data (not the
// raw rubric), so their prompts are much smaller and stay well under the
// per-call time limit. Split into two so neither call has to produce too
// much prose in one shot. Both are functions of the student's name so the
// same rubric works for any student.
export function synthesisPartAInstructions(studentName: string): string {
  return `You previously classified ${studentName}'s answers to all 24 questions of a social studies diagnostic (S = Secure, P = Partial, M = Misconception, U = Unknown/Missing). You will be given that full list of 24 per-question classifications, each with the concepts it provided evidence about and any misconception detail.

Do not provide an overall percentage or grade level. Using only the classifications provided, produce two outputs and return them ONLY via the submit_concept_map_and_domains tool call (no other prose).

1. Concept Map: organize the concepts evidenced across all 24 answers under Secure, Partial, Misconceptions, Unknown/Missing, and Insufficient Evidence. For every misconception, state it specifically (concept name, then what incorrect model ${studentName} appears to hold) rather than just a bare label. Keep each entry to one line.

2. Domain-Level Interpretation: summarize their current picture across these nine domains, as a 2-3 sentence prose description of the structure of their knowledge in that domain (not an averaged score) — synthesize across whichever of the 24 questions are relevant to each domain: Maps & spatial thinking; Physical & human geography; Historical time & historical reasoning; Societies, culture & belief; Government, law & political power; U.S. civics & constitutional government; Economics, resources & trade; Interaction between peoples & societies; Big patterns of historical change.`;
}

export function synthesisPartBInstructions(studentName: string): string {
  return `You previously classified ${studentName}'s answers to all 24 questions of a social studies diagnostic (S = Secure, P = Partial, M = Misconception, U = Unknown/Missing). You will be given that full list of 24 per-question classifications, each with the concepts it provided evidence about and any misconception detail.

Using only the classifications provided, produce three outputs and return them ONLY via the submit_misconceptions_and_plan tool call (no other prose). Keep every field to 1-2 sentences.

1. Most Important Misconceptions: identify misconceptions separately from missing knowledge, ranked by instructional importance, especially where a misconception could interfere with later learning.

2. Adaptive Follow-Up Probes: recommend additional questions only where they will meaningfully reduce uncertainty. Do not continue probing domains that are already clearly Secure. Aim for roughly 2-5 probes total, only in genuinely uncertain domains, rather than a full second diagnostic.

3. Preliminary Instructional Implications: identify likely prerequisite concepts that should be taught first, areas that may need little or no initial instruction, misconceptions that should be explicitly reconstructed, and any concepts that should be probed further before deciding. Teaching order should follow prerequisite relationships, not conventional grade-level sequence (e.g. geography → resources → settlement → civilizations → trade → empires; chronology → cause/effect → multiple causation → historical change; government → authority/law → limits on power → Constitution → separation of powers → federalism/elections; scarcity → specialization → trade → markets → supply/demand).

The long-term purpose of this diagnostic is to discover the smallest set of foundational social-studies concepts ${studentName} needs to build a coherent framework for later history, geography, civics, economics, and current events.`;
}
