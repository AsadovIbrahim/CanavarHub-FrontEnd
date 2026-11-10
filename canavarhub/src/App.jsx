import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ModulesSection from './components/ModulesSection';
import QuestionsSection from './components/QuestionsSection';
import StatisticsSection from './components/StatisticsSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentView === 'register') {
    return <RegisterPage onNavigate={handleNavigate} />;
  }

  return (
    <>
      <Navbar onNavigate={handleNavigate} />
      <main>
        <Hero onNavigate={handleNavigate} />
        <ModulesSection />
        <QuestionsSection />
        <StatisticsSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}

export default App;
