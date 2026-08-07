import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { selectSidebarOpen } from '../../features/uiSlice';
import { selectIsAuth } from '../../features/userSlice';
import './AppLayout.css';

export default function AppLayout() {
  const isAuth = useSelector(selectIsAuth);
  const sidebarOpen = useSelector(selectSidebarOpen);

  return (
    <div className="app-layout">
      <Header />
      {isAuth && <Sidebar />}
      <main className={`app-main ${isAuth && sidebarOpen ? 'with-sidebar' : ''}`}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
