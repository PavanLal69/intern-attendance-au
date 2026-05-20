import { Users, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { getTodayKey, formatDate } from '../utils/storage';
import './Dashboard.css';

export default function Dashboard() {
  const { interns, getTodaySummary, getAttendanceDates } = useApp();
  const summary = getTodaySummary();
  const today = getTodayKey();
  const recentDates = getAttendanceDates().slice(0, 7);

  const stats = [
    {
      label: 'Total Interns',
      value: interns.length,
      icon: Users,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
      label: 'Present Today',
      value: summary.present,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Absent Today',
      value: summary.absent,
      icon: XCircle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            <Calendar size={14} />
            {formatDate(today)}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="dashboard-grid">
        <GlassCard className="today-summary">
          <h2 className="section-title">Today's Summary</h2>
          <div className="summary-content">
            {summary.total === 0 ? (
              <div className="empty-state">
                <Users size={40} color="#d1d5db" />
                <p>No interns added yet</p>
              </div>
            ) : (
              <>
                <div className="summary-chart">
                  <div className="progress-ring">
                    <svg width="140" height="140">
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="rgba(0,0,0,0.05)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray={`${
                          (summary.present / summary.total) * 377
                        } 377`}
                        strokeLinecap="round"
                        transform="rotate(-90 70 70)"
                      />
                    </svg>
                    <div className="progress-center">
                      <span className="progress-value">
                        {summary.total > 0
                          ? Math.round((summary.present / summary.total) * 100)
                          : 0}
                        %
                      </span>
                      <span className="progress-label">Present</span>
                    </div>
                  </div>
                </div>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="summary-stat-label">Present</span>
                    <span className="summary-stat-value present">
                      {summary.present}
                    </span>
                  </div>

                  <div className="summary-stat">
                    <span className="summary-stat-label">Absent</span>
                    <span className="summary-stat-value absent">
                      {summary.absent}
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-label">Leave</span>
                    <span className="summary-stat-value leave">{summary.leave}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-label">Unmarked</span>
                    <span className="summary-stat-value unmarked">
                      {summary.unmarked}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </GlassCard>

        <GlassCard className="recent-activity">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentDates.length === 0 ? (
              <div className="empty-state">
                <Calendar size={40} color="#d1d5db" />
                <p>No attendance records yet</p>
              </div>
            ) : (
              recentDates.map((date) => (
                <div key={date} className="activity-item">
                  <div className="activity-date">
                    <Calendar size={14} />
                    {formatDate(date)}
                  </div>
                  <div className="activity-badge">
                    {date === today ? 'Today' : 'Recorded'}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
