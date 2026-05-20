import { LayoutDashboard, CalendarCheck, Users, BarChart3, ShieldCheck, GraduationCap, X, ClipboardList, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance',   icon: ClipboardList },
  { id: 'interns',    label: 'Interns',      icon: Users },
  { id: 'analytics',  label: 'Analytics',    icon: BarChart3 },
  { id: 'scan',       label: 'Scan QR Code', icon: QrCode },
];

const adminItems = [
  { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
];

const portalItems = [
  { id: 'intern-portal', label: 'Intern Portal', icon: GraduationCap },
];

export default function Sidebar() {
  const { activeView, setActiveView, mobileSidebarOpen, setMobileSidebarOpen } = useApp();

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <CalendarCheck size={22} />
        </div>
        <div className="logo-text">
          <span className="logo-title">AttendTrack</span>
          <span className="logo-sub">Intern Monitor</span>
        </div>
        {mobileSidebarOpen && (
          <button className="sidebar-close-btn" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => handleNavClick(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}

        <div className="nav-divider" />
        <p className="nav-section-label">Admin</p>
        {adminItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => handleNavClick(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}

        <div className="nav-divider" />
        <p className="nav-section-label">Portal</p>
        {portalItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item portal-item ${activeView === id ? 'active' : ''}`}
            onClick={() => handleNavClick(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">© 2026 AttendTrack</p>
      </div>
    </aside>
  );
}
