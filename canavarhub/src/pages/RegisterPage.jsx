import React, { useState } from 'react';

export default function RegisterPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    age: '',
    level: '',
    goal: '',
    time: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    if (!formData[field].toString().trim()) {
      setErrors((prev) => ({ ...prev, [field]: 'Bu xana doldurulmalıdır' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      if (!formData[field].toString().trim()) {
        newErrors[field] = 'Bu xana doldurulmalıdır';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Qeydiyyat uğurla tamamlandı');
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <a 
          href="/" 
          className="register-logo"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
        >
          CANAVAR<span>HUB</span>
        </a>

        <h1>Yeni hesab yarat</h1>
        <p>Təlim səviyyəni seç və inkişaf yoluna başla.</p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label> Ad </label>
            <input
              type="text"
              placeholder="Adınız"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              style={{ borderColor: errors.name ? '#E85D3F' : '#E7E4DA' }}
            />
            {errors.name && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> Soyad </label>
            <input
              type="text"
              placeholder="Soyadınız"
              value={formData.surname}
              onChange={(e) => handleChange('surname', e.target.value)}
              onBlur={() => handleBlur('surname')}
              style={{ borderColor: errors.surname ? '#E85D3F' : '#E7E4DA' }}
            />
            {errors.surname && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.surname}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> Email </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              style={{ borderColor: errors.email ? '#E85D3F' : '#E7E4DA' }}
            />
            {errors.email && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> Şifrə </label>
            <input
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              style={{ borderColor: errors.password ? '#E85D3F' : '#E7E4DA' }}
            />
            {errors.password && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> Yaş </label>
            <input
              type="number"
              placeholder="Yaşınız"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              onBlur={() => handleBlur('age')}
              style={{ borderColor: errors.age ? '#E85D3F' : '#E7E4DA' }}
            />
            {errors.age && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.age}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> İngilis dili səviyyəniz </label>
            <select
              value={formData.level}
              onChange={(e) => handleChange('level', e.target.value)}
              onBlur={() => handleBlur('level')}
              style={{ borderColor: errors.level ? '#E85D3F' : '#E7E4DA' }}
            >
              <option disabled value="">Səviyyə seç</option>
              <option value="A1">A1 - Başlanğıc</option>
              <option value="A2">A2 - Təməl</option>
              <option value="B1">B1 - Orta</option>
              <option value="B2">B2 - Yuxarı orta</option>
              <option value="C1">C1 - Sərbəst</option>
            </select>
            {errors.level && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.level}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> Əsas məqsədiniz </label>
            <select
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              onBlur={() => handleBlur('goal')}
              style={{ borderColor: errors.goal ? '#E85D3F' : '#E7E4DA' }}
            >
              <option disabled value="">Seçin</option>
              <option value="english">İngilis dili öyrənmək</option>
              <option value="chess">Şahmat inkişafı</option>
              <option value="logic">Məntiq bacarıqları</option>
              <option value="general">Ümumi inkişaf</option>
            </select>
            {errors.goal && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.goal}
              </span>
            )}
          </div>

          <div className="form-group">
            <label> Gündə neçə dəqiqə məşq edə bilərsiniz? </label>
            <select
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              onBlur={() => handleBlur('time')}
              style={{ borderColor: errors.time ? '#E85D3F' : '#E7E4DA' }}
            >
              <option disabled value="">Seçin</option>
              <option value="15m">15 dəqiqə</option>
              <option value="30m">30 dəqiqə</option>
              <option value="1h">1 saat</option>
              <option value="2h">2 saat+</option>
            </select>
            {errors.time && (
              <span className="error-message" style={{ display: 'block' }}>
                {errors.time}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Qeydiyyatdan keç
          </button>
        </form>

        <button 
          type="button" 
          className="back-login"
          onClick={() => onNavigate('login')}
        >
          Artıq hesabım var
        </button>
      </section>
    </main>
  );
}
