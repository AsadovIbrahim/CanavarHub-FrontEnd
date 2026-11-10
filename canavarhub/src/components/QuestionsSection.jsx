import React, { useState } from 'react';

export default function QuestionsSection() {
  const [activeLevel, setActiveLevel] = useState('a1');
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const levels = [
    { id: 'a1', label: 'A1' },
    { id: 'a2', label: 'A2' },
    { id: 'b1', label: 'B1' },
    { id: 'b2', label: 'B2' },
    { id: 'c1', label: 'C1' },
  ];

  const questionsData = {
    a1: {
      badge: 'A1 · Sual 214/500',
      question: 'She ___ to school every day.',
      options: [
        { text: 'go', correct: false },
        { text: 'goes', correct: true },
        { text: 'going', correct: false },
        { text: 'gone', correct: false },
      ],
    },
    a2: {
      badge: 'A2 · Sual 88/550',
      question: 'If it rains tomorrow, we ___ the picnic.',
      options: [
        { text: 'cancel', correct: false },
        { text: 'will cancel', correct: true },
        { text: 'cancelling', correct: false },
        { text: 'cancelled', correct: false },
      ],
    },
    b1: {
      badge: 'B1 · Sual 340/550',
      question: 'By the time we arrived, the movie had already ___.',
      options: [
        { text: 'started', correct: true },
        { text: 'starting', correct: false },
        { text: 'start', correct: false },
        { text: 'starts', correct: false },
      ],
    },
    b2: {
      badge: 'B2 · Sual 12/600',
      question: 'The report, ___ conclusions were disputed, was withdrawn.',
      options: [
        { text: 'that', correct: false },
        { text: 'whose', correct: true },
        { text: 'which', correct: false },
        { text: 'who', correct: false },
      ],
    },
    c1: {
      badge: 'C1 · Sual 501/600',
      question: 'Had the committee acted earlier, the crisis might have been ___.',
      options: [
        { text: 'avert', correct: false },
        { text: 'averted', correct: true },
        { text: 'averting', correct: false },
        { text: 'averts', correct: false },
      ],
    },
  };

  const handleAnswerClick = (levelId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [levelId]: optionIndex,
    }));
  };

  return (
    <section id="questions" className="questions-section" aria-labelledby="questions-title">
      <header className="section-header">
        <span className="section-tag"> Sual nümunəsi </span>
        <h2 id="questions-title">İngilis dili səviyyəni yoxla</h2>
        <p>Səviyyəni seç və nümunə suallarla biliklərini sına.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Dil səviyyələri">
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            className={`tab ${activeLevel === lvl.id ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeLevel === lvl.id}
            onClick={() => setActiveLevel(lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {Object.entries(questionsData).map(([lvlId, data]) => {
        const selectedIdx = selectedAnswers[lvlId];
        const isActive = activeLevel === lvlId;

        return (
          <article
            key={lvlId}
            className={`question-card ${isActive ? 'active' : ''}`}
          >
            <span className="level-badge">{data.badge}</span>
            <h3>{data.question}</h3>

            <div className="answers">
              {data.options.map((option, idx) => {
                const isSelected = selectedIdx === idx;
                let answerClass = 'answer';
                let displayText = option.text;

                if (isSelected) {
                  if (option.correct) {
                    answerClass += ' correct';
                    displayText += ' ✓';
                  } else {
                    answerClass += ' incorrect';
                    displayText += ' ✕';
                  }
                } else if (option.correct && selectedIdx !== undefined) {
                  answerClass += ' correct';
                }

                return (
                  <button
                    key={idx}
                    className={answerClass}
                    type="button"
                    onClick={() => handleAnswerClick(lvlId, idx)}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
  );
}
