import type { ReactNode } from "react";
import PrintableLessonDoc from "./PrintableLessonDoc";

export default function Lesson1_1Plan() {
  return (
    <PrintableLessonDoc
      title="Lesson 1.1 — What Social Studies Asks"
      subtitle="Teacher lesson plan · About 35–45 minutes · Anchor case: a fictional Kansas town's outdoor warning-siren system"
    >
      <Section title="Teacher Orientation">
        <p>
          This lesson introduces Jackson to four major kinds of social-studies questions: history, geography,
          civics, and economics.
        </p>
        <p>
          Jackson will first read a short story about a fictional Kansas town's warning-siren system. The story
          includes information about how the system changed, where sirens are located, who makes decisions about
          them, and what they cost. Those details provide one concrete situation that can be examined in four
          different ways.
        </p>
        <p>
          Each lens begins with a question about the story. The answer to that question leads naturally to the
          meaning of the lens. Jackson then applies the same idea to a new situation involving a community park and
          a proposed basketball court.
        </p>
        <p>
          The goal is not to memorize formal definitions. It is to recognize the kind of question being asked and
          understand that more than one kind of question may matter in the same real-world situation.
        </p>
        <p className="muted">
          This lesson does not teach timelines, historical evidence, government structure, map skills, or later
          economic concepts. The controlling curriculum defines Lesson 1.1 as distinguishing history, geography,
          civics, and economics as lenses that often work together, using Kansas warning sirens as the anchor.
        </p>
      </Section>

      <Section title="Lesson Purpose">
        <p>
          Teach Jackson to recognize history, geography, civics, and economics as four different kinds of questions
          that can be asked about the same real-world situation.
        </p>
      </Section>

      <Section title="Materials">
        <p>Everything needed is included below. No teacher-created materials are needed.</p>
        <ul>
          <li>Warning Siren Story</li>
          <li>Community Park student page</li>
          <li>Answer key</li>
        </ul>
      </Section>

      <Section title="1. Start With This Warning-Siren Example">
        <h3>Warning Sirens in Prairie View, Kansas</h3>
        <p className="muted">Prairie View is a fictional Kansas town created for this lesson.</p>
        <p>Prairie View uses outdoor warning sirens to warn people about dangerous weather.</p>
        <p>
          Years ago, the town had two sirens near the center of town. As Prairie View grew, new neighborhoods were
          built farther away. Some people in those neighborhoods had trouble hearing the old sirens, so the town
          added two more.
        </p>
        <p>Today, Prairie View has four warning sirens in different parts of town.</p>
        <p>
          The city council decides whether the town will buy new sirens or replace old ones. Each year, the town
          sets aside $2,000 to inspect and maintain the four sirens. Replacing one siren would cost much more, so
          the council has to decide how much money the town can spend on the warning system.
        </p>
        <p className="muted">This is the example for the lesson.</p>
      </Section>

      <Section title="2. Look at the Same Story Through Four Lenses">
        <LensBlock
          name="History"
          question="How has Prairie View's warning-siren system changed over time?"
          answer="The town started with two sirens near the center of town and later added two more, so it now has four."
          takeaway="That is looking at how something changed over time."
          definition="History — How did it get to be this way?"
        />
        <LensBlock
          name="Geography"
          question="Why did Prairie View add sirens in different parts of town?"
          answer="The town had grown, newer neighborhoods were farther from the original sirens, and some people could not hear them well."
          takeaway="That is looking at where things are and why location matters."
          definition="Geography — Where is it, and how does the place matter?"
        />
        <LensBlock
          name="Civics"
          question="Who decides whether Prairie View buys or replaces a warning siren?"
          answer="The city council."
          takeaway="That is looking at how a community makes shared decisions."
          definition="Civics — How does the community make shared decisions?"
        />
        <LensBlock
          name="Economics"
          question="Why can't Prairie View simply spend as much money as it wants on its warning sirens?"
          answer="The town has money set aside to maintain the sirens, while replacing one would cost much more. The town has to decide how much money it can use for the warning system."
          takeaway="That is looking at how money and resources are used."
          definition="Economics — How are money and resources used?"
        />
      </Section>

      <Section title="3. Four Ways of Looking at the Same Warning-Siren System">
        <p>There are four different ways of looking at Prairie View's warning-siren system:</p>
        <ul>
          <li>
            <strong>History:</strong> How did the town go from two sirens to four?
          </li>
          <li>
            <strong>Geography:</strong> Why are the sirens located in different parts of town?
          </li>
          <li>
            <strong>Civics:</strong> Who decides whether the town buys or replaces a siren?
          </li>
          <li>
            <strong>Economics:</strong> How much money can the town spend on the siren system?
          </li>
        </ul>
        <p>These questions focus on different parts of the same real-world situation.</p>
        <p>
          The curriculum's goal is not just for Jackson to sort the four lenses, but also to recognize that more
          than one lens may be useful when trying to understand a situation.
        </p>
      </Section>

      <Section title="4. New Situation — Community Park">
        <p>
          A town has a community park with a large grassy area. Some people want the town to build a basketball
          court there. Other people want to keep the grassy area open. Building the court would cost money, and
          town leaders must decide what to do.
        </p>
        <p className="muted">Have Jackson complete the Student Worksheet now. The answer key below is for you.</p>

        <table className="per-question-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Correct lens</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Who gets to decide whether the basketball court is built?</td>
              <td>
                <strong>Civics</strong>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>How has the park been used by people in the community over the years?</td>
              <td>
                <strong>History</strong>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>How much would the basketball court cost?</td>
              <td>
                <strong>Economics</strong>
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>Where in the park could the basketball court be built?</td>
              <td>
                <strong>Geography</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="sublist">
          <h4>Question 5</h4>
          <p>Would the town need to think about more than one of these questions before deciding whether to build the court? Explain.</p>
          <p>
            Jackson should recognize that more than one lens may be useful. A sufficient answer might be:
            <br />
            <em>“Yes. They need to know where the court could go, who decides, and what it costs.”</em>
          </p>
          <p>Several kinds of information could matter: where the court could go; who makes the decision; what it would cost; how the park has been used.</p>
          <p className="muted">
            The important idea is not that every situation always needs all four lenses. It is that a real
            social-studies issue may involve more than one kind of question.
          </p>
        </div>
      </Section>

      <Section title="End-of-Lesson Success">
        <p>Jackson has reached the lesson goal if he can:</p>
        <ul>
          <li>identify whether a new question is mainly about history, geography, civics, or economics; and</li>
          <li>explain that more than one kind of question may matter in the same real-world situation.</li>
        </ul>
        <p>A simple explanation such as:</p>
        <p>
          <em>“For the basketball court, you need to know where it could go, who decides, and what it costs.”</em>
        </p>
        <p>shows the intended understanding.</p>
      </Section>

      <Section title="If Jackson Needs Help">
        <p>Use the shortest useful distinction:</p>
        <ul>
          <li>
            <strong>History</strong> — How did it get to be this way?
          </li>
          <li>
            <strong>Geography</strong> — Where is it, and how does the place matter?
          </li>
          <li>
            <strong>Civics</strong> — How does the community make shared decisions?
          </li>
          <li>
            <strong>Economics</strong> — How are money and resources used?
          </li>
        </ul>
        <p>Then return to the specific question he is working on.</p>
      </Section>

      <Section title="Answer Key">
        <ol>
          <li>Civics</li>
          <li>History</li>
          <li>Economics</li>
          <li>Geography</li>
        </ol>
        <p>
          For Question 5, Jackson should recognize that more than one lens may be useful. A sufficient answer
          might be: <em>“Yes. They need to know where the court could go, who decides, and what it costs.”</em>
        </p>
      </Section>
    </PrintableLessonDoc>
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

function LensBlock({
  name,
  question,
  answer,
  takeaway,
  definition,
}: {
  name: string;
  question: string;
  answer: string;
  takeaway: string;
  definition: string;
}) {
  return (
    <div className="lens-block">
      <h3>{name}</h3>
      <p>{question}</p>
      <p>{answer}</p>
      <p className="muted">{takeaway}</p>
      <p>
        <strong>{definition}</strong>
      </p>
    </div>
  );
}
