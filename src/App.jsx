import { AppProvider, useApp } from './context/AppContext';
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

function AppShell() {
  const { activeView, isAdminLoggedIn, isInternLoggedIn, currentIntern } = useApp();

  // ── Intern portal: aligned with main layout ─────────────────────────────
  if (activeView === 'intern-portal') {
    const showSidebar = isInternLoggedIn && !!currentIntern;
    return (
      <div className="app-layout">
        {showSidebar && <Sidebar />}
        <main className="main-content" style={{ marginLeft: showSidebar ? undefined : 0 }}>
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
        {isAdminLoggedIn && <Sidebar />}
        <main className="main-content" style={{ marginLeft: isAdminLoggedIn ? undefined : 0 }}>
          {isAdminLoggedIn ? <AdminPage /> : <AdminLogin />}
        </main>
      </div>
    );
  }

  // ── Normal views with sidebar ───────────────────────────────────────────
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
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

