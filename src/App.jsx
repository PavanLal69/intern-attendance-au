import { AppProvider, useApp } from './context/AppContext';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AttendancePage from './components/AttendancePage';
import InternsPage from './components/InternsPage';
import AnalyticsPage from './components/AnalyticsPage';
import AdminPage from './components/AdminPage';
import AdminLogin from './components/AdminLogin';
import ScanPage from './components/ScanPage';
import InternLogin from './components/InternLogin';
import InternDashboard from './components/InternDashboard';
import './App.css';

const VIEW_TITLES = {
  dashboard: 'Dashboard',
  attendance: 'Mark Attendance',
  interns: 'Interns List',
  analytics: 'Analytics',
  scan: 'Scan QR Code',
  admin: 'Admin Panel',
  'intern-portal': 'Intern Portal',
};

function MobileHeader({ title, onMenuClick }) {
  return (
    <header className="mobile-top-bar">
      <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu size={22} />
      </button>
      <h1 className="mobile-top-bar-title">{title}</h1>
      <div style={{ width: 32 }} />
    </header>
  );
}

function AppShell() {
  const {
    activeView,
    isAdminLoggedIn,
    isInternLoggedIn,
    currentIntern,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useApp();

  const title = VIEW_TITLES[activeView] || 'AttendTrack';

  // ── Intern portal: aligned with main layout ─────────────────────────────
  if (activeView === 'intern-portal') {
    const showSidebar = isInternLoggedIn && !!currentIntern;
    return (
      <div className="app-layout">
        {showSidebar && mobileSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
        )}
        {showSidebar && <Sidebar />}
        <main className="main-content" style={{ marginLeft: showSidebar ? undefined : 0 }}>
          {showSidebar && (
            <MobileHeader title={title} onMenuClick={() => setMobileSidebarOpen(true)} />
          )}
          <div className="intern-portal-root">
            {isInternLoggedIn && currentIntern ? <InternDashboard /> : <InternLogin />}
          </div>
        </main>
      </div>
    );
  }

  // ── Admin view: full-screen login gate ──────────────────────────────────
  if (activeView === 'admin') {
    return (
      <div className="app-layout">
        {isAdminLoggedIn && mobileSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
        )}
        {isAdminLoggedIn && <Sidebar />}
        <main className="main-content" style={{ marginLeft: isAdminLoggedIn ? undefined : 0 }}>
          {isAdminLoggedIn && (
            <MobileHeader title={title} onMenuClick={() => setMobileSidebarOpen(true)} />
          )}
          {isAdminLoggedIn ? <AdminPage /> : <AdminLogin />}
        </main>
      </div>
    );
  }

  // ── Normal views with sidebar ───────────────────────────────────────────
  return (
    <div className="app-layout">
      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <Sidebar />
      <main className="main-content">
        <MobileHeader title={title} onMenuClick={() => setMobileSidebarOpen(true)} />
        {activeView === 'dashboard'  && <Dashboard />}
        {activeView === 'attendance' && <AttendancePage />}
        {activeView === 'interns'    && <InternsPage />}
        {activeView === 'analytics'  && <AnalyticsPage />}
        {activeView === 'scan'       && <ScanPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

