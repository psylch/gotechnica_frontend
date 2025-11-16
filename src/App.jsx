import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import Card from './pages/Card.jsx';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const containerClass = location.pathname === '/upload' ? 'page-container full-bleed' : 'page-container';

  return (
    <div className="app-shell">
      <div className="gradient-bg" aria-hidden />
      <div className="grain-overlay" aria-hidden />
      <main className={containerClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/card" element={<Card />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
