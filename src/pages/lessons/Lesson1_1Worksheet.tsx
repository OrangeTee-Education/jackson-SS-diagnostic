import PrintableLessonDoc from "./PrintableLessonDoc";

const QUESTIONS = [
  "Who gets to decide whether the basketball court is built?",
  "How has the park been used by people in the community over the years?",
  "How much would the basketball court cost?",
  "Where in the park could the basketball court be built?",
];

export default function Lesson1_1Worksheet() {
  return (
    <PrintableLessonDoc title="Community Park" subtitle="Lesson 1.1 · Student Worksheet">
      <div className="worksheet-fields">
        <span>Name: _______________________</span>
        <span>Date: _______________</span>
      </div>

      <section className="report-section">
        <p>
          A town has a community park with a large grassy area. Some people want the town to build a basketball
          court there. Other people want to keep the grassy area open. Building the court would cost money, and
          town leaders must decide what to do.
        </p>

        <div className="lens-reference">
          <p>
            <strong>History</strong> — How did it get to be this way?
          </p>
          <p>
            <strong>Geography</strong> — Where is it, and how does the place matter?
          </p>
          <p>
            <strong>Civics</strong> — How does the community make shared decisions?
          </p>
          <p>
            <strong>Economics</strong> — How are money and resources used?
          </p>
        </div>
      </section>

      <section className="report-section">
        <ol className="worksheet-questions">
          {QUESTIONS.map((q, i) => (
            <li key={i} className="worksheet-question">
              <p>{q}</p>
              <p className="muted">History / Geography / Civics / Economics</p>
            </li>
          ))}
          <li className="worksheet-question">
            <p>Would the town need to think about more than one of these questions before deciding whether to build the court? Explain.</p>
            <div className="answer-lines">
              <div className="answer-line" />
              <div className="answer-line" />
              <div className="answer-line" />
            </div>
          </li>
        </ol>
      </section>
    </PrintableLessonDoc>
  );
}
