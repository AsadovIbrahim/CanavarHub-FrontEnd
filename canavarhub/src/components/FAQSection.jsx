import React from 'react';

export default function FAQSection() {
  return (
    <section className="faq-section" aria-label="Tez-tez verilən suallar">
      <h2>Tez-tez verilən suallar</h2>

      <details>
        <summary>CanavarHub nədir?</summary>
        <p>CanavarHub şəxsi inkişaf və online təhsil platformasıdır.</p>
      </details>

      <details>
        <summary>Hansı sahələr öyrədilir?</summary>
        <p>İngilis dili, məntiq, analitika, şahmat və diksiya.</p>
      </details>
    </section>
  );
}
