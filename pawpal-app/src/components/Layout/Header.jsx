import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toggleDarkMode, selectDarkMode, toggleSidebar } from '../../features/uiSlice';
import { selectUser, logout } from '../../features/userSlice';
import { getInitials } from '../../utils/helpers';
import './Header.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useSelector(selectDarkMode);
  const user = useSelector(selectUser);

  const isHome = location.pathname === '/';

  return (
    <header className="app-header glass">
      <div className="header-left">
        {!isHome && (
          <button
            className="header-menu-btn"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
        <div className="header-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🐾</span>
          <span className="logo-text">PawPal</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={() => dispatch(toggleDarkMode())}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
            </svg>
          )}
        </button>

        {user ? (
          <div className="header-user">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              {user.isPremium && <span className="badge badge-primary">Premium</span>}
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => { dispatch(logout()); navigate('/'); }}>
              Logout
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
