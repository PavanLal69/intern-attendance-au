import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Umbrella, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { getTodayKey, formatDate } from '../utils/storage';
import './AttendancePage.css';

const STATUS_CONFIG = {
  present: { label: 'Present', icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  late: { label: 'Late', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  absent: { label: 'Absent', icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  leave: { label: 'Leave', icon: Umbrella, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

export default function AttendancePage() {
  const { interns, markAttendance, getAttendanceStatus } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  function changeDate(offset) {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  const isToday = selectedDate === getTodayKey();

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Mark daily attendance for all interns</p>
        </div>
      </div>

      <GlassCard className="date-selector">
        <button className="date-nav-btn" onClick={() => changeDate(-1)}>
          <ChevronLeft size={18} />
        </button>
        <div className="date-display">
          <Calendar size={16} />
          <span>{formatDate(selectedDate)}</span>
          {isToday && <span className="today-badge">Today</span>}
        </div>
        <button
          className="date-nav-btn"
          onClick={() => changeDate(1)}
          disabled={isToday}
        >
          <ChevronRight size={18} />
        </button>
      </GlassCard>

      {interns.length === 0 ? (
        <GlassCard className="empty-card">
          <div className="empty-state">
            <Calendar size={48} color="#d1d5db" />
            <h3>No interns yet</h3>
            <p>Add interns from the Interns tab to start marking attendance.</p>
          </div>
        </GlassCard>
      ) : (
        <div className="attendance-list">
          {interns.map((intern) => {
            const status = getAttendanceStatus(intern.id, selectedDate);
            return (
              <GlassCard key={intern.id} className="attendance-row">
                <div className="intern-info">
                  <div className="intern-avatar">
                    {intern.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="intern-name">{intern.name}</p>
                    <p className="intern-dept">{intern.department}</p>
                  </div>
                </div>
                <div className="status-buttons">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const isActive = status === key;
                    return (
                      <button
                        key={key}
                        className={`status-btn ${isActive ? 'active' : ''}`}
                        style={
                          isActive
                            ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color }
                            : {}
                        }
                        onClick={() => markAttendance(intern.id, selectedDate, key)}
                        title={cfg.label}
                      >
                        <Icon size={15} />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
                {status && (
                  <div
                    className="current-status"
                    style={{
                      color: STATUS_CONFIG[status].color,
                      backgroundColor: STATUS_CONFIG[status].bg,
                    }}
                  >
                    {STATUS_CONFIG[status].label}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
