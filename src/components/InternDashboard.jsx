import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  LogOut, CheckCircle2, Clock3, Circle,
  CalendarCheck, TrendingUp, XCircle, Umbrella,
  ClipboardList, GraduationCap, Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { getTodayKey, formatDate } from '../utils/storage';
import './InternDashboard.css';

const STATUS_META = {
  not_started: { label: 'Not Started', icon: Circle,       color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  in_progress:  { label: 'In Progress', icon: Clock3,       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  completed:    { label: 'Completed',   icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
};

const TASK_CYCLE = ['not_started', 'in_progress', 'completed'];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <GlassCard className="id-stat-card">
      <div className="id-stat-icon" style={{ background: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="id-stat-label">{label}</p>
        <p className="id-stat-value" style={{ color }}>{value}</p>
      </div>
    </GlassCard>
  );
}

// ── Attendance History Chart ──────────────────────────────────────────────────
function AttendanceChart({ internId }) {
  const { getInternAttendanceHistory } = useApp();
  const history = getInternAttendanceHistory(internId, 14);

  const STATUS_COLOR = {
    present: '#10b981',
    absent:  '#ef4444',
    leave:   '#8b5cf6',
  };

  if (history.length === 0) {
    return (
      <div className="id-chart-empty">
        <TrendingUp size={36} color="#d1d5db" />
        <p>No attendance records yet</p>
      </div>
    );
  }

  // Convert to numeric for bar: 1 = present, 0 = absent/leave/null
  const data = history.map((h) => ({
    date: h.date,
    value: h.present,
    status: h.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={(v) => (v === 1 ? 'In' : 'Out')} />
        <Tooltip
          contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10 }}
          formatter={(_, __, props) => {
            const s = props.payload.status;
            return [s ? s.charAt(0).toUpperCase() + s.slice(1) : 'No record', 'Status'];
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.status ? STATUS_COLOR[entry.status] || '#d1d5db' : '#e5e7eb'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Task Item ─────────────────────────────────────────────────────────────────
function TaskItem({ task, internId }) {
  const { getTaskStatus, updateTaskStatus } = useApp();
  const status = getTaskStatus(internId, task.id);
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  function cycleStatus() {
    const idx = TASK_CYCLE.indexOf(status);
    const next = TASK_CYCLE[(idx + 1) % TASK_CYCLE.length];
    updateTaskStatus(internId, task.id, next);
  }

  return (
    <div className={`id-task-item ${status}`}>
      <div className="id-task-left">
        <button
          className="id-task-status-btn"
          style={{ background: meta.bg, color: meta.color, borderColor: meta.color }}
          onClick={cycleStatus}
          title="Click to change status"
        >
          <Icon size={14} />
          <span>{meta.label}</span>
        </button>
        <div className="id-task-info">
          <p className="id-task-title" style={{ textDecoration: status === 'completed' ? 'line-through' : 'none' }}>
            {task.title}
          </p>
          {task.description && <p className="id-task-desc">{task.description}</p>}
        </div>
      </div>
      <div className="id-task-right">
        {task.dueDate && (
          <span className="id-task-due">Due {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
        <span className="id-task-assigned">
          Assigned {new Date(task.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

// ── Main Intern Dashboard ─────────────────────────────────────────────────────
export default function InternDashboard() {
  const { currentIntern, logoutIntern, getInternStats, getInternTasks, getTaskStatus, setActiveView } = useApp();
  const [taskFilter, setTaskFilter] = useState('all');

  if (!currentIntern) return null;

  const stats = getInternStats(currentIntern.id);
  const today = getTodayKey();
  const allTasks = getInternTasks(currentIntern.id);

  const filteredTasks = taskFilter === 'all'
    ? allTasks
    : allTasks.filter((t) => getTaskStatus(currentIntern.id, t.id) === taskFilter);

  const taskCounts = {
    all:         allTasks.length,
    not_started: allTasks.filter((t) => getTaskStatus(currentIntern.id, t.id) === 'not_started').length,
    in_progress: allTasks.filter((t) => getTaskStatus(currentIntern.id, t.id) === 'in_progress').length,
    completed:   allTasks.filter((t) => getTaskStatus(currentIntern.id, t.id) === 'completed').length,
  };

  return (
    <div className="intern-dashboard">
      {/* ── Header ── */}
      <div className="id-header">
        <div className="id-header-left">
          <div className="id-avatar">{currentIntern.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="id-welcome">Welcome back, <span>{currentIntern.name.split(' ')[0]}</span></h1>
            <div className="id-meta">
              <span><Building2 size={13} /> {currentIntern.department}</span>
              {currentIntern.className && <span><GraduationCap size={13} /> {currentIntern.className}</span>}
              <span><CalendarCheck size={13} /> {formatDate(today)}</span>
            </div>
          </div>
        </div>
        <div className="id-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="id-logout-btn" style={{ background: '#10b981', color: '#fff', borderColor: '#10b981' }} onClick={() => setActiveView('scan')}>
            Scan QR
          </button>
          <button className="id-logout-btn" onClick={logoutIntern}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Attendance Stats ── */}
      <div className="id-stats-grid">
        <StatCard label="Present"  value={stats.present}        icon={CheckCircle2} color="#10b981" bg="rgba(16,185,129,0.1)" />
        <StatCard label="Absent"   value={stats.absent}         icon={XCircle}      color="#ef4444" bg="rgba(239,68,68,0.1)"  />
        <StatCard label="Leave"    value={stats.leave}          icon={Umbrella}     color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
        <StatCard label="Attendance Rate" value={`${stats.attendanceRate}%`} icon={TrendingUp} color="#2563eb" bg="rgba(37,99,235,0.1)" />
      </div>

      {/* ── Chart + Today ── */}
      <div className="id-mid-grid">
        <GlassCard className="id-chart-card">
          <h2 className="id-section-title">Attendance History <span>(last 14 days)</span></h2>
          <AttendanceChart internId={currentIntern.id} />
          <div className="id-chart-legend">
            {[['#10b981','Present'],['#ef4444','Absent'],['#8b5cf6','Leave'],['#e5e7eb','No record']].map(([c,l]) => (
              <span key={l} className="id-legend-item">
                <span className="id-legend-dot" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="id-summary-card">
          <h2 className="id-section-title">Overall Summary</h2>
          <div className="id-donut-wrap">
            <svg width="130" height="130">
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="12" />
              <circle cx="65" cy="65" r="54" fill="none" stroke="#10b981" strokeWidth="12"
                strokeDasharray={`${(stats.present / Math.max(stats.total,1)) * 339} 339`}
                strokeLinecap="round" transform="rotate(-90 65 65)" />
            </svg>
            <div className="id-donut-center">
              <span className="id-donut-val">{stats.attendanceRate}%</span>
              <span className="id-donut-lbl">Rate</span>
            </div>
          </div>
          <div className="id-summary-rows">
            {[
              { label: 'Total Days Recorded', value: stats.total,        color: '#6366f1' },
              { label: 'Present',              value: stats.present,     color: '#10b981' },
              { label: 'Absent',               value: stats.absent,      color: '#ef4444' },
              { label: 'Leave',                value: stats.leave,       color: '#8b5cf6' },
            ].map((r) => (
              <div key={r.label} className="id-summary-row">
                <span className="id-summary-label">{r.label}</span>
                <span className="id-summary-value" style={{ color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Tasks ── */}
      <GlassCard className="id-tasks-card">
        <div className="id-tasks-header">
          <div>
            <h2 className="id-section-title">
              <ClipboardList size={18} /> My Tasks
            </h2>
            <p className="id-tasks-sub">{allTasks.length} task{allTasks.length !== 1 ? 's' : ''} assigned</p>
          </div>
          <div className="id-task-filters">
            {[
              { key: 'all',         label: 'All' },
              { key: 'not_started', label: 'Not Started' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed',   label: 'Completed' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`id-filter-btn ${taskFilter === key ? 'active' : ''}`}
                onClick={() => setTaskFilter(key)}
              >
                {label}
                <span className="id-filter-count">{taskCounts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="id-tasks-empty">
            <ClipboardList size={40} color="#d1d5db" />
            <p>{allTasks.length === 0 ? 'No tasks assigned yet.' : 'No tasks in this category.'}</p>
          </div>
        ) : (
          <div className="id-tasks-list">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} internId={currentIntern.id} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
