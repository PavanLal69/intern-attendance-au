import { LayoutDashboard, CalendarCheck, Users, BarChart3, ShieldCheck, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'analytics',  label: 'Analytics',   icon: BarChart3 },
];

const adminItems = [
  { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
];

const portalItems = [
  { id: 'intern-portal', label: 'Intern Portal', icon: GraduationCap },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <CalendarCheck size={22} />
        </div>
        <div className="logo-text">
          <span className="logo-title">AttendTrack</span>
          <span className="logo-sub">Intern Monitor</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => setActiveView(id)}
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
            onClick={() => setActiveView(id)}
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
            onClick={() => setActiveView(id)}
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
