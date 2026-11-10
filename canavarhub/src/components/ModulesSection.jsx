import React from 'react';

export default function ModulesSection() {
  const modules = [
    {
      icon: '🔤',
      colorClass: 'coral',
      title: 'İngilis dili',
      description: 'A1-dən C1 səviyyəsinə qədər qrammatika, lüğət və danışıq bacarıqlarını inkişaf etdir.',
      stats: [
        { value: '5', label: 'Səviyyə' },
        { value: '2750+', label: 'Sual' }
      ]
    },
    {
      icon: '🧩',
      colorClass: 'indigo',
      title: 'Məntiqi düşüncə',
      description: 'Ardıcıllıq, analiz, problem həlli və məntiq tapşırıqları.',
      stats: [
        { value: '4', label: 'Səviyyə' },
        { value: '2200+', label: 'Sual' }
      ]
    },
    {
      icon: '💡',
      colorClass: 'teal',
      title: 'Yaradıcı düşüncə',
      description: 'Yeni ideyalar yaratmaq, fərqli baxış formalaşdırmaq.',
      stats: [
        { value: '4', label: 'Səviyyə' },
        { value: '2200+', label: 'Sual' }
      ]
    },
    {
      icon: '📊',
      colorClass: 'coral',
      title: 'Analitik düşüncə',
      description: 'Məlumat analizi, qrafik oxuma, səbəb və nəticə əlaqələri.',
      stats: [
        { value: '4', label: 'Səviyyə' },
        { value: '2200+', label: 'Sual' }
      ]
    },
    {
      icon: '🧠',
      colorClass: 'indigo',
      title: 'İntellektual zəka',
      description: 'IQ testləri, yaddaş, məkan təsəvvürü və düşüncə məşqləri.',
      stats: [
        { value: '4', label: 'Səviyyə' },
        { value: '2200+', label: 'Sual' }
      ]
    },
    {
      icon: '♟️',
      colorClass: 'teal',
      title: 'Şahmat',
      description: 'Şahmat əsaslarından strategiyaya qədər mərhələli təlim sistemi.',
      stats: [
        { value: '6', label: 'Mərhələ' },
        { value: '4', label: 'AI səviyyə' }
      ]
    },
    {
      icon: '🎤',
      colorClass: 'coral',
      title: 'Diksiya',
      description: 'Düzgün tələffüz, nitq texnikası və təqdimat bacarıqları.',
      stats: [
        { value: '10+', label: 'Dərs' },
        { value: '4', label: 'Blok' }
      ]
    }
  ];

  return (
    <section id="modules" className="modules-section" aria-labelledby="modules-title">
      <header className="section-header">
        <span className="section-tag"> Modullar </span>
        <h2 id="modules-title">7 inkişaf modulu ilə bacarıqlarını artır</h2>
        <p>
          CanavarHub müxtəlif sahələr üzrə interaktiv təlimlər, praktiki
          çalışmalar və minlərlə sual bazası təqdim edir.
        </p>
      </header>

      <div className="module-grid">
        {modules.map((module, index) => (
          <article key={index} className="module-card">
            <span className={`module-icon ${module.colorClass}`} aria-hidden="true">
              {module.icon}
            </span>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <div className="module-stats">
              {module.stats.map((stat, sIndex) => (
                <div key={sIndex}>
                  <strong> {stat.value} </strong>
                  <span> {stat.label} </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
