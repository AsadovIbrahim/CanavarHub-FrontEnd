import React from 'react';

export default function StatisticsSection() {
  const stats = [
    { number: '7', label: 'Modul' },
    { number: '6000+', label: 'Sual' },
    { number: '4', label: 'AI şahmat' },
    { number: '10+', label: 'Diksiya dərsi' }
  ];

  return (
    <section
      id="statistics"
      className="statistics-section"
      aria-label="Platform statistikası"
    >
      <div className="statistics-grid">
        {stats.map((stat, index) => (
          <article key={index} className="stat-card">
            <strong> {stat.number} </strong>
            <span> {stat.label} </span>
          </article>
        ))}
      </div>
    </section>
  );
}
