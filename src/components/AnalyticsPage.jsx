import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { formatDate } from '../utils/storage';
import './AnalyticsPage.css';

const STATUS_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  leave: '#8b5cf6',
};

function InternBarChart({ interns, getInternStats }) {
  const data = interns.map((intern) => {
    const stats = getInternStats(intern.id);
    return {
      name: intern.name.split(' ')[0],
      Present: stats.present,
      Absent: stats.absent,
      Leave: stats.leave,
      Rate: stats.attendanceRate,
    };
  });

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        />
        <Legend />
        <Bar dataKey="Present" fill={STATUS_COLORS.present} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Absent" fill={STATUS_COLORS.absent} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Leave" fill={STATUS_COLORS.leave} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  
  function OverallPieChart({ interns, getInternStats }) {
    let present = 0, absent = 0, leave = 0;
    interns.forEach((intern) => {
      const s = getInternStats(intern.id);
      present += s.present;
      absent += s.absent;
      leave += s.leave;
    });
  
    const data = [
      { name: 'Present', value: present, color: STATUS_COLORS.present },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return (
    <div className="chart-empty">No attendance data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function AttendanceTrendChart({ attendance, interns }) {
  const dates = Object.keys(attendance).sort();
  const last14 = dates.slice(-14);

  const data = last14.map((date) => {
    const dayRecord = attendance[date] || {};
    let present = 0, total = 0;
    interns.forEach((intern) => {
      if (dayRecord[intern.id]) {
        total++;
        if (dayRecord[intern.id] === 'present') {
          present++;
        }
      }
    });
    return {
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

  if (data.length === 0) return (
    <div className="chart-empty">No attendance data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} unit="%" />
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
          }}
          formatter={(v) => [`${v}%`, 'Attendance Rate']}
        />
        <Line
          type="monotone"
          dataKey="Rate"
          stroke="#4f8ef7"
          strokeWidth={2.5}
          dot={{ fill: '#4f8ef7', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function InternLeaderboard({ interns, getInternStats }) {
  const ranked = interns
    .map((intern) => ({ ...intern, stats: getInternStats(intern.id) }))
    .filter((i) => i.stats.total > 0)
    .sort((a, b) => b.stats.attendanceRate - a.stats.attendanceRate);

  if (ranked.length === 0) {
    return <div className="chart-empty">No attendance data yet</div>;
  }

  return (
    <div className="leaderboard">
      {ranked.map((intern, idx) => (
        <div key={intern.id} className="leaderboard-row">
          <span className={`rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}`}>
            #{idx + 1}
          </span>
          <div className="lb-avatar">{intern.name.charAt(0).toUpperCase()}</div>
          <div className="lb-info">
            <p className="lb-name">{intern.name}</p>
            <p className="lb-dept">{intern.department}</p>
          </div>
          <div className="lb-stats">
            <div className="lb-bar-wrap">
              <div
                className="lb-bar"
                style={{ width: `${intern.stats.attendanceRate}%` }}
              />
            </div>
            <span className="lb-rate">{intern.stats.attendanceRate}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { interns, attendance, getInternStats } = useApp();

  // Overall totals
  let totalPresent = 0, totalAbsent = 0, totalLeave = 0;
  interns.forEach((intern) => {
    const s = getInternStats(intern.id);
    totalPresent += s.present;
    totalAbsent += s.absent;
    totalLeave += s.leave;
  });
  const totalRecords = totalPresent + totalAbsent + totalLeave;
  const overallRate = totalRecords > 0
    ? Math.round((totalPresent / totalRecords) * 100)
    : 0;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Attendance insights across all interns</p>
        </div>
      </div>

      <div className="analytics-stats">
        <GlassCard className="analytics-stat-card">
          <p className="analytics-stat-label">Overall Rate</p>
          <p className="analytics-stat-value" style={{ color: '#4f8ef7' }}>{overallRate}%</p>
        </GlassCard>
        <GlassCard className="analytics-stat-card">
          <p className="analytics-stat-label">Total Present</p>
          <p className="analytics-stat-value" style={{ color: '#10b981' }}>{totalPresent}</p>
        </GlassCard>
        <GlassCard className="analytics-stat-card">
          <p className="analytics-stat-label">Total Absent</p>
          <p className="analytics-stat-value" style={{ color: '#ef4444' }}>{totalAbsent}</p>
        </GlassCard>
        <GlassCard className="analytics-stat-card">
          <p className="analytics-stat-label">Total Leave</p>
          <p className="analytics-stat-value" style={{ color: '#8b5cf6' }}>{totalLeave}</p>
        </GlassCard>
      </div>

      <div className="analytics-grid">
        <GlassCard className="chart-card wide">
          <h2 className="section-title">Attendance by Intern</h2>
          {interns.length === 0 ? (
            <div className="chart-empty">No interns added yet</div>
          ) : (
            <InternBarChart interns={interns} getInternStats={getInternStats} />
          )}
        </GlassCard>

        <GlassCard className="chart-card">
          <h2 className="section-title">Overall Distribution</h2>
          <OverallPieChart interns={interns} getInternStats={getInternStats} />
        </GlassCard>

        <GlassCard className="chart-card">
          <h2 className="section-title">Attendance Trend (Last 14 Days)</h2>
          <AttendanceTrendChart attendance={attendance} interns={interns} />
        </GlassCard>

        <GlassCard className="chart-card wide">
          <h2 className="section-title">Intern Leaderboard</h2>
          <InternLeaderboard interns={interns} getInternStats={getInternStats} />
        </GlassCard>
      </div>
    </div>
  );
}
