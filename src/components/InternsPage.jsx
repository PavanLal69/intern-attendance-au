import { useState } from 'react';
import {
  Plus,
  Trash2,
  StickyNote,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Mail,
  Building2,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import './InternsPage.css';

function AddInternModal({ onClose }) {
  const { addIntern } = useApp();
  const [form, setForm] = useState({
    name: '',
    department: '',
    className: '',
    email: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await addIntern(form);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <GlassCard className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Intern</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label><User size={14} /> Full Name *</label>
              <input
                type="text" placeholder="e.g. Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label><Building2 size={14} /> Department *</label>
              <input
                type="text" placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={errors.department ? 'error' : ''}
              />
              {errors.department && <span className="error-msg">{errors.department}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><GraduationCap size={14} /> Class / Batch</label>
              <input
                type="text" placeholder="e.g. Batch 2025-A"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label><Mail size={14} /> Email *</label>
              <input
                type="email" placeholder="e.g. jane@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
          </div>
          <div className="form-group">
            <label><CalendarDays size={14} /> Start Date *</label>
            <input
              type="date" value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-msg">{errors.startDate}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Intern</button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

function NoteSection({ intern }) {
  const { addNote, deleteNote } = useApp();
  const [noteText, setNoteText] = useState('');

  function handleAdd() {
    if (!noteText.trim()) return;
    addNote(intern.id, noteText);
    setNoteText('');
  }

  return (
    <div className="notes-section">
      <h4 className="notes-title"><StickyNote size={14} /> Notes</h4>
      <div className="note-input-row">
        <input
          type="text" placeholder="Add a note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="note-input"
        />
        <button className="btn-primary btn-sm" onClick={handleAdd}>Add</button>
      </div>
      {intern.notes && intern.notes.length > 0 ? (
        <div className="notes-list">
          {intern.notes.map((note) => (
            <div key={note.id} className="note-item">
              <p className="note-text">{note.text}</p>
              <div className="note-meta">
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <button className="icon-btn danger" onClick={() => deleteNote(intern.id, note.id)}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-notes">No notes yet.</p>
      )}
    </div>
  );
}

function InternCard({ intern }) {
  const { deleteIntern, getInternStats } = useApp();
  const [expanded, setExpanded] = useState(false);
  const stats = getInternStats(intern.id);

  return (
    <GlassCard className="intern-card">
      <div className="intern-card-header">
        <div className="intern-info">
          <div className="intern-avatar large">
            {intern.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="intern-name">{intern.name}</p>
            <div className="intern-tags">
              <span className="tag dept-tag">{intern.department}</span>
              {intern.className && (
                <span className="tag class-tag">
                  <GraduationCap size={11} /> {intern.className}
                </span>
              )}
            </div>
            {intern.email && <p className="intern-email">{intern.email}</p>}
          </div>
        </div>
        <div className="intern-card-actions">
          <div className="mini-stats">
            <span className="mini-stat present">{stats.present}P</span>
            <span className="mini-stat absent">{stats.absent}A</span>
            <span className="rate-badge">{stats.attendanceRate}%</span>
          </div>
          <button className="icon-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            className="icon-btn danger"
            onClick={() => {
              if (window.confirm(`Remove ${intern.name}? This will also delete their attendance records.`))
                deleteIntern(intern.id);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="intern-card-body">
          <div className="intern-details">
            <div className="detail-item">
              <CalendarDays size={13} />
              <span>Started: {new Date(intern.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {intern.className && (
              <div className="detail-item">
                <GraduationCap size={13} />
                <span>Class: {intern.className}</span>
              </div>
            )}
            {intern.email && (
              <div className="detail-item">
                <Mail size={13} />
                <span>{intern.email}</span>
              </div>
            )}
          </div>
          <NoteSection intern={intern} />
        </div>
      )}
    </GlassCard>
  );
}

export default function InternsPage() {
  const { interns } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = interns.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.department.toLowerCase().includes(search.toLowerCase()) ||
      (i.className || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="interns-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Interns</h1>
          <p className="page-subtitle">{interns.length} intern{interns.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Intern
        </button>
      </div>

      <div className="search-bar-wrapper">
        <GlassCard className="search-bar">
          <input
            type="text"
            placeholder="Search by name, department or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </GlassCard>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="empty-card">
          <div className="empty-state">
            <User size={48} color="#d1d5db" />
            <h3>{interns.length === 0 ? 'No interns yet' : 'No results found'}</h3>
            <p>{interns.length === 0 ? 'Click "Add Intern" to get started.' : 'Try a different search term.'}</p>
          </div>
        </GlassCard>
      ) : (
        <div className="interns-list">
          {filtered.map((intern) => (
            <InternCard key={intern.id} intern={intern} />
          ))}
        </div>
      )}

      {showModal && <AddInternModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
