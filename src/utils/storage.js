// LocalStorage helpers for persisting data

export const STORAGE_KEYS = {
  INTERNS: 'attendance_interns',
  ATTENDANCE: 'attendance_records',
  QR_TOKENS: 'attendance_qr_tokens',
  ADMIN_CREDENTIALS: 'attendance_admin_credentials',
  TASKS: 'attendance_tasks',
  INTERN_SESSION: 'attendance_intern_session',
};

export function loadInterns() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INTERNS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}
export function saveInterns(interns) {
  localStorage.setItem(STORAGE_KEYS.INTERNS, JSON.stringify(interns));
}

export function loadAttendance() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}
export function saveAttendance(attendance) {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
}

export function loadQrTokens() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QR_TOKENS);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}
export function saveQrTokens(tokens) {
  localStorage.setItem(STORAGE_KEYS.QR_TOKENS, JSON.stringify(tokens));
}

export function loadAdminCredentials() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}
export function saveAdminCredentials(username, password) {
  localStorage.setItem(
    STORAGE_KEYS.ADMIN_CREDENTIALS,
    JSON.stringify({ username: username.trim(), password })
  );
}

// Tasks: { [taskId]: { id, title, description, internId, assignedAt, dueDate } }
export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}
export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// Intern session: { internId } or null
export function loadInternSession() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INTERN_SESSION);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}
export function saveInternSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.INTERN_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.INTERN_SESSION);
  }
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function generateToken() {
  return (
    Math.random().toString(36).slice(2, 8).toUpperCase() +
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
}
