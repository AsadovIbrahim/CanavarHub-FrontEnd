import React from 'react';

export default function Navbar({ onNavigate }) {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    onNavigate('home');
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Əsas menyu">
        <a 
          href="/" 
          className="logo" 
          aria-label="CanavarHub ana səhifə"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          CANAVAR<span>HUB</span>
        </a>

        <ul className="nav-links">
          <li>
            <a href="#modules" onClick={(e) => handleNavClick(e, 'modules')}> Modullar </a>
          </li>
          <li>
            <a href="#questions" onClick={(e) => handleNavClick(e, 'questions')}> Suallar </a>
          </li>
          <li>
            <a href="#statistics" onClick={(e) => handleNavClick(e, 'statistics')}> Statistikalar </a>
          </li>
        </ul>

        <button
          type="button"
          className="btn btn-primary"
          aria-label="Hesaba daxil ol"
          onClick={() => onNavigate('login')}
        >
          Daxil ol
        </button>
      </nav>
    </header>
  );
}
