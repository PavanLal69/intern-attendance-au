import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck, RefreshCw, QrCode, LogOut, Copy, Check,
  Users, UserPlus, Trash2, User, Mail, Building2, CalendarDays,
  GraduationCap, Download, CheckCircle2, ClipboardList, Plus, X,
  Clock3, Circle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { getTodayKey, formatDate } from '../utils/storage';
import './AdminPage.css';

// ── Inline Add Intern Section ─────────────────────────────────────────────────

function AddInternSection() {
  const { addIntern } = useApp();
  const emptyForm = {
    name: '',
    department: '',
    className: '',
    email: '',
    startDate: new Date().toISOString().split('T')[0],
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSuccess('');
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.department.trim()) e.department = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.startDate) e.startDate = 'Required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const intern = await addIntern(form);
    if (intern) setSuccess(`${intern.name} added successfully!`);
    setForm(emptyForm);
    setErrors({});
  }

  return (
    <GlassCard className="add-intern-section">
      <div className="section-heading">
        <div className="section-heading-icon">
          <UserPlus size={18} />
        </div>
        <div>
          <h2 className="section-title">Add New Intern</h2>
          <p className="section-sub">Fill in the details below to register an intern</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-intern-form" noValidate>
        {/* Row 1 */}
        <div className="form-grid">
          <div className="form-group">
            <label><User size={13} /> Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Jane Smith"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label><Building2 size={13} /> Department *</label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              className={errors.department ? 'error' : ''}
            />
            {errors.department && <span className="error-msg">{errors.department}</span>}
          </div>

          <div className="form-group">
            <label><GraduationCap size={13} /> Class / Batch</label>
            <input
              type="text"
              placeholder="e.g. Batch 2025-A"
              value={form.className}
              onChange={(e) => set('className', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><Mail size={13} /> Email *</label>
            <input
              type="email"
              placeholder="e.g. jane@company.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label><CalendarDays size={13} /> Start Date *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-msg">{errors.startDate}</span>}
          </div>

          <div className="form-group form-submit-cell">
            <button type="submit" className="btn-primary btn-add-intern">
              <UserPlus size={16} /> Add Intern
            </button>
          </div>
        </div>

        {success && (
          <div className="success-banner">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
      </form>
    </GlassCard>
  );
}

// ── QR Panel ─────────────────────────────────────────────────────────────────

function QrPanel() {
  const { generateDailyToken, getDailyToken } = useApp();
  const today = getTodayKey();
  const tokenData = getDailyToken(today);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const appUrl = window.location.origin + window.location.pathname;
  const qrValue = tokenData ? `${appUrl}?scan=${tokenData.token}` : '';

  function handleGenerate() { generateDailyToken(today); }

  function handleCopy() {
    if (!tokenData) return;
    navigator.clipboard.writeText(tokenData.token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-qr-${today}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <GlassCard className="qr-panel">
      <div className="qr-panel-header">
        <div>
          <h2 className="section-title">Daily QR Code</h2>
          <p className="section-sub">{formatDate(today)}</p>
        </div>
        <div className="qr-actions">
          {tokenData && (
            <>
              <button className="btn-outline" onClick={handleCopy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy Token'}
              </button>
              <button className="btn-outline" onClick={handleDownload}>
                <Download size={15} /> Download
              </button>
            </>
          )}
          <button className="btn-primary" onClick={handleGenerate}>
            <RefreshCw size={15} />
            {tokenData ? 'Regenerate' : 'Generate QR'}
          </button>
        </div>
      </div>

      {tokenData ? (
        <div className="qr-content">
          <div className="qr-code-wrap" ref={qrRef}>
            <QRCodeSVG
              value={qrValue}
              size={220}
              bgColor="transparent"
              fgColor="#1a1a2e"
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="qr-info">
            <div className="token-display">
              <p className="token-label">Token</p>
              <p className="token-value">{tokenData.token}</p>
            </div>
            <div className="qr-instructions">
              <p className="instruction-title">How it works</p>
              <ol className="instruction-list">
                <li>Show this QR code to interns on a screen or printout.</li>
                <li>Interns scan it with their phone camera.</li>
                <li>They land on the Scan QR page and select their name.</li>
                <li>Attendance is marked as <strong>Present</strong> instantly.</li>
              </ol>
            </div>
            <div className="qr-meta">
              <span>Generated at {new Date(tokenData.createdAt).toLocaleTimeString()}</span>
              <span className="qr-valid-badge">Valid for today</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="qr-empty">
          <QrCode size={56} color="#d1d5db" />
          <p>No QR code generated for today yet.</p>
          <p className="qr-empty-sub">Click "Generate QR" to create one.</p>
        </div>
      )}
    </GlassCard>
  );
}

// ── Intern List Panel ─────────────────────────────────────────────────────────

function InternListPanel() {
  const { interns, deleteIntern, getInternStats } = useApp();
  const [search, setSearch] = useState('');

  const filtered = interns.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.department.toLowerCase().includes(search.toLowerCase()) ||
      (i.className || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GlassCard className="intern-mgmt-panel">
      <div className="panel-header">
        <div>
          <h2 className="section-title">Registered Interns</h2>
          <p className="section-sub">
            {interns.length} intern{interns.length !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search by name, department or class..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="panel-empty">
          <Users size={36} color="#d1d5db" />
          <p>
            {interns.length === 0
              ? 'No interns yet. Add one above.'
              : 'No results found.'}
          </p>
        </div>
      ) : (
        <div className="intern-table">
          <div className="intern-table-head">
            <span>Name</span>
            <span>Department</span>
            <span>Class</span>
            <span>Rate</span>
            <span></span>
          </div>
          {filtered.map((intern) => {
            const stats = getInternStats(intern.id);
            return (
              <div key={intern.id} className="intern-table-row">
                <div className="intern-cell-name">
                  <div className="intern-avatar-sm">
                    {intern.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="intern-name-text">{intern.name}</p>
                    {intern.email && <p className="intern-email-text">{intern.email}</p>}
                  </div>
                </div>
                <span className="intern-dept-text">{intern.department}</span>
                <span className="intern-class-text">
                  {intern.className ? (
                    <span className="class-pill">{intern.className}</span>
                  ) : (
                    <span className="no-class">—</span>
                  )}
                </span>
                <span className="intern-rate-text">{stats.attendanceRate}%</span>
                <button
                  className="icon-btn danger"
                  onClick={() => {
                    if (window.confirm(`Remove ${intern.name}?`)) deleteIntern(intern.id);
                  }}
                  title="Delete intern"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

// ── Task Assignment Section ───────────────────────────────────────────────────

const TASK_STATUS_META = {
  not_started: { label: 'Not Started', icon: Circle,       color: '#9ca3af' },
  in_progress:  { label: 'In Progress', icon: Clock3,       color: '#f59e0b' },
  completed:    { label: 'Completed',   icon: CheckCircle2, color: '#10b981' },
};

function TaskAssignSection() {
  const { interns, tasks, assignTask, deleteTask, getTaskStatus } = useApp();
  const emptyForm = { internId: '', title: '', description: '', dueDate: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [filterInternId, setFilterInternId] = useState('');

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.internId) errs.internId = 'Select an intern';
    if (!form.title.trim()) errs.title = 'Title is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const intern = interns.find((i) => i.id === form.internId);
    await assignTask(form.internId, { title: form.title, description: form.description, dueDate: form.dueDate });
    if (intern) setSuccess(`Task assigned to ${intern.name}!`);
    setForm(emptyForm);
  }

  const allTasks = Object.values(tasks);
  const displayTasks = filterInternId
    ? allTasks.filter((t) => t.internId === filterInternId)
    : allTasks;

  // Sort newest first
  displayTasks.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

  return (
    <GlassCard className="task-assign-section">
      <div className="section-heading">
        <div className="section-heading-icon task-icon">
          <ClipboardList size={18} />
        </div>
        <div>
          <h2 className="section-title">Assign Tasks</h2>
          <p className="section-sub">Assign tasks to interns and track their progress</p>
        </div>
      </div>

      {/* Assign form */}
      <form onSubmit={handleSubmit} className="task-form" noValidate>
        <div className="task-form-grid">
          <div className="form-group">
            <label><User size={13} /> Intern *</label>
            <select
              value={form.internId}
              onChange={(e) => set('internId', e.target.value)}
              className={errors.internId ? 'error' : ''}
            >
              <option value="">— Select intern —</option>
              {interns.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.department})</option>
              ))}
            </select>
            {errors.internId && <span className="error-msg">{errors.internId}</span>}
          </div>

          <div className="form-group">
            <label><ClipboardList size={13} /> Task Title *</label>
            <input
              type="text" placeholder="e.g. Complete onboarding docs"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-msg">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label><CalendarDays size={13} /> Due Date (optional)</label>
            <input
              type="date" value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>

          <div className="form-group form-submit-cell">
            <button type="submit" className="btn-primary btn-add-intern">
              <Plus size={15} /> Assign Task
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '-4px' }}>
          <label>Description (optional)</label>
          <input
            type="text" placeholder="Brief description of the task..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {success && (
          <div className="success-banner">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}
      </form>

      {/* Task list */}
      <div className="task-list-header">
        <p className="task-list-title">All Tasks <span className="task-count-badge">{allTasks.length}</span></p>
        <select
          className="task-filter-select"
          value={filterInternId}
          onChange={(e) => setFilterInternId(e.target.value)}
        >
          <option value="">All Interns</option>
          {interns.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      {displayTasks.length === 0 ? (
        <div className="panel-empty">
          <ClipboardList size={32} color="#d1d5db" />
          <p>{allTasks.length === 0 ? 'No tasks assigned yet.' : 'No tasks for this intern.'}</p>
        </div>
      ) : (
        <div className="task-rows">
          {displayTasks.map((task) => {
            const intern = interns.find((i) => i.id === task.internId);
            const status = getTaskStatus(task.internId, task.id);
            const meta = TASK_STATUS_META[status];
            const Icon = meta.icon;
            return (
              <div key={task.id} className="task-row">
                <div className="task-row-left">
                  <div className="intern-avatar-sm">
                    {intern ? intern.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="task-row-info">
                    <p className="task-row-title">{task.title}</p>
                    <p className="task-row-intern">{intern?.name} · {intern?.department}</p>
                    {task.description && <p className="task-row-desc">{task.description}</p>}
                  </div>
                </div>
                <div className="task-row-right">
                  <span className="task-status-badge" style={{ color: meta.color, background: `${meta.color}18` }}>
                    <Icon size={12} /> {meta.label}
                  </span>
                  {task.dueDate && (
                    <span className="task-due-badge">
                      Due {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <button className="icon-btn danger" onClick={() => deleteTask(task.id)} title="Delete task">
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
// ── Attendance Table ──────────────────────────────────────────────────────────

function AttendanceTablePanel() {
  const { interns, getInternStats } = useApp();

  return (
    <GlassCard className="attendance-report-panel admin-full-row">
      <div className="section-heading">
        <div className="section-heading-icon">
          <CalendarDays size={18} />
        </div>
        <div>
          <h2 className="section-title">Intern Attendance Report</h2>
          <p className="section-sub">Tabular view of all interns attendance metrics</p>
        </div>
      </div>
      
      {interns.length === 0 ? (
        <div className="panel-empty" style={{ padding: '30px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No interns registered yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table className="admin-attendance-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Intern Name</th>
                <th style={{ textAlign: 'left' }}>Department</th>
                <th>Total Days</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern) => {
                const stats = getInternStats(intern.id);
                return (
                  <tr key={intern.id}>
                    <td>
                      <div className="intern-cell-name">
                        <div className="intern-avatar-sm" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                          {intern.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="intern-name-text">{intern.name}</span>
                      </div>
                    </td>
                    <td className="intern-dept-text">{intern.department}</td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{stats.total}</td>
                    <td style={{ textAlign: 'center', color: '#10b981', fontWeight: '600' }}>{stats.present}</td>
                    <td style={{ textAlign: 'center', color: '#ef4444', fontWeight: '600' }}>{stats.absent}</td>
                    <td style={{ textAlign: 'center', color: '#6366f1', fontWeight: '600' }}>{stats.leave}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: stats.attendanceRate >= 80 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: stats.attendanceRate >= 80 ? '#059669' : '#b45309',
                        fontSize: '12px'
                      }}>
                        {stats.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const { logoutAdmin, adminEmail } = useApp();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={24} /> Admin Panel
          </h1>
          <p className="page-subtitle">
            Signed in as <strong>{adminEmail || 'Admin'}</strong> · Manage interns and generate daily QR codes
          </p>
        </div>
        <button className="btn-logout" onClick={logoutAdmin}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <div className="admin-grid">
        <AttendanceTablePanel />
        <QrPanel />
        <AddInternSection />
        <InternListPanel />
        <TaskAssignSection />
      </div>
    </div>
  );
}
