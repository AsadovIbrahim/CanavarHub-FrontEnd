import React, { useState } from 'react';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Bu xana doldurulmalıdır';
    }
    if (!password.trim()) {
      newErrors.password = 'Bu xana doldurulmalıdır';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Giriş sistemi hazırlanır...');
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <a 
          href="/" 
          className="login-logo"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
        >
          CANAVAR<span>HUB</span>
        </a>

        <h1>Hesaba daxil ol</h1>
        <p>Öyrənməyə davam etmək üçün hesabına giriş et.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email"> Email </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ borderColor: errors.email ? '#E85D3F' : '#E7E4DA' }}
          />
          {errors.email && (
            <span className="error-message" style={{ display: 'block' }}>
              {errors.email}
            </span>
          )}

          <label htmlFor="password"> Şifrə </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ borderColor: errors.password ? '#E85D3F' : '#E7E4DA' }}
          />
          {errors.password && (
            <span className="error-message" style={{ display: 'block' }}>
              {errors.password}
            </span>
          )}

          <button type="submit" className="btn btn-primary">
            Daxil ol
          </button>
        </form>

        <button 
          type="button" 
          className="back-home-btn"
          onClick={() => onNavigate('home')}
        >
          Ana səhifəyə qayıt
        </button>

        <div className="register-link">
          Hesabın yoxdur?{' '}
          <button type="button" onClick={() => onNavigate('register')}>
            Qeydiyyatdan keç
          </button>
        </div>
      </section>
    </main>
  );
}
