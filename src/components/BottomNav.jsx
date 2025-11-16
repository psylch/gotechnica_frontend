import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext.jsx';

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/' },
  { id: 'card', label: 'Card', icon: '🃏', path: '/card' },
  { id: 'chat', label: 'Chat', icon: '💬', path: '/card?chat=open' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { card },
  } = useAppState();

  const handlePress = useCallback(
    (item) => {
      if ((item.id === 'card' || item.id === 'chat') && !card) {
        navigate('/upload');
        return;
      }
      navigate(item.path);
    },
    [card, navigate]
  );

  const isActive = (item) => {
    if (item.id === 'chat') {
      return location.pathname === '/card' && location.search.includes('chat');
    }
    if (item.id === 'card') {
      return location.pathname === '/card' && !location.search.includes('chat');
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="bottom-nav" aria-label="primary navigation">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${isActive(item) ? 'active' : ''}`}
          onClick={() => handlePress(item)}
        >
          <span aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
