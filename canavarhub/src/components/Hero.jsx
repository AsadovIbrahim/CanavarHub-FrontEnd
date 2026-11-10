import React from 'react';

export default function Hero({ onNavigate }) {
  const handleScrollToModules = (e) => {
    e.preventDefault();
    const element = document.getElementById('modules');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <span className="eyebrow"> ● Prototip · v1.0 · Açıq platforma </span>

        <h1 id="hero-title">
          Biliyi <span className="accent"> nəhəng </span> canavara çevir
        </h1>

        <p className="hero-description">
          CanavarHub ilə yeni biliklər qazan, düşüncə bacarıqlarını inkişaf
          etdir və öz potensialını artır.
        </p>

        <div className="hero-actions">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => onNavigate('register')}
          >
            Təlimə başla
          </button>

          <a 
            href="#modules" 
            className="btn btn-outline"
            onClick={handleScrollToModules}
          >
            Modulları gör
          </a>
        </div>
      </div>

      <div className="learning-progress" aria-label="İngilis dili səviyyələri">
        <article className="progress-item">
          <div className="progress-track">
            <span style={{ width: '22%' }}></span>
          </div>
          <strong> A1 </strong>
          <small> Başlanğıc </small>
        </article>

        <article className="progress-item">
          <div className="progress-track">
            <span style={{ width: '38%' }}></span>
          </div>
          <strong> A2 </strong>
          <small> Təməl </small>
        </article>

        <article className="progress-item">
          <div className="progress-track">
            <span style={{ width: '55%' }}></span>
          </div>
          <strong> B1 </strong>
          <small> Orta </small>
        </article>

        <article className="progress-item">
          <div className="progress-track">
            <span style={{ width: '70%' }}></span>
          </div>
          <strong> B2 </strong>
          <small> Yuxarı orta </small>
        </article>

        <article className="progress-item">
          <div className="progress-track">
            <span style={{ width: '86%' }}></span>
          </div>
          <strong> C1 </strong>
          <small> Sərbəst </small>
        </article>
      </div>
    </section>
  );
}
