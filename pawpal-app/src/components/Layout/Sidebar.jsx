import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { selectSidebarOpen } from '../../features/uiSlice';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/pets', label: 'My Pets', icon: '🐾' },
  { path: '/reminders', label: 'Reminders', icon: '🔔' },
  { path: '/emergency', label: 'Emergency Card', icon: '🚨' },
  { path: '/vets', label: 'Veterinarians', icon: '🩺' },
  { path: '/documents', label: 'Documents', icon: '📁' },
];

export default function Sidebar() {
  const isOpen = useSelector(selectSidebarOpen);

  return (
    <>
      <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-promo glass">
            <span className="promo-icon">⭐</span>
            <p className="promo-text">Upgrade to Premium</p>
            <span className="promo-sub">Unlimited pets & features</span>
          </div>
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" />}
    </>
  );
}
