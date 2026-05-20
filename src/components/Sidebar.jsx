import {
  LayoutDashboard, CalendarCheck, Users, BarChart3, ShieldCheck,
  GraduationCap, X, ClipboardList, QrCode, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

// ── Nav item definitions ──────────────────────────────────────────────────────

const ADMIN_NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance',      icon: ClipboardList },
  { id: 'interns',    label: 'Interns',         icon: Users },
  { id: 'analytics',  label: 'Analytics',       icon: BarChart3 },
  { id: 'admin',      label: 'Admin Panel',     icon: ShieldCheck },
];

const INTERN_NAV = [
  { id: 'intern-portal', label: 'My Dashboard', icon: GraduationCap },
  { id: 'scan',          label: 'Scan QR Code', icon: QrCode },
];

export default function Sidebar() {
  const {
    activeView,
    setActiveView,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isAdminLoggedIn,
    isInternLoggedIn,
    currentIntern,
    logoutAdmin,
    logoutIntern,
  } = useApp();

  const isIntern = isInternLoggedIn && !!currentIntern;
  const navItems = isIntern ? INTERN_NAV : ADMIN_NAV;

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    setMobileSidebarOpen(false);
    if (isIntern) {
      logoutIntern();
    } else if (isAdminLoggedIn) {
      logoutAdmin();
    }
  };

  return (
    <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <CalendarCheck size={22} />
        </div>
        <div className="logo-text">
          <span className="logo-title">AttendTrack</span>
          <span className="logo-sub">
            {isIntern ? currentIntern.name : 'Admin Portal'}
          </span>
        </div>
        {mobileSidebarOpen && (
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''} ${id === 'intern-portal' || id === 'scan' ? 'portal-item' : ''}`}
            onClick={() => handleNavClick(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
        <p className="sidebar-footer-text">© 2026 AttendTrack</p>
      </div>
    </aside>
  );
}
