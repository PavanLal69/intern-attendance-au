import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { generateId, generateToken, getTodayKey } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [interns, setInterns] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [qrTokens, setQrTokens] = useState({});
  // tasks: { [taskId]: { id, title, description, internId, assignedAt, dueDate } }
  const [tasks, setTasks] = useState({});
  // taskStatuses: { [internId]: { [taskId]: 'not_started'|'in_progress'|'completed' } }
  // stored inside each intern object under intern.taskStatuses

  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('scan') ? 'scan' : 'dashboard';
  });

  const [authUser, setAuthUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentInternId, setCurrentInternId] = useState(null);
  const [hasAdminAccount, setHasAdminAccount] = useState(false);

  // -- Live data subscriptions ---------------------------------------------

  useEffect(() => {
    const unsubInterns = onSnapshot(collection(db, 'interns'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInterns(list);
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      const next = {};
      snap.forEach((d) => {
        const data = d.data();
        next[d.id] = data.records || {};
      });
      setAttendance(next);
    });

    const unsubQrTokens = onSnapshot(collection(db, 'qrTokens'), (snap) => {
      const next = {};
      snap.forEach((d) => {
        next[d.id] = d.data();
      });
      setQrTokens(next);
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      const next = {};
      snap.forEach((d) => {
        next[d.id] = { id: d.id, ...d.data() };
      });
      setTasks(next);
    });

    return () => {
      unsubInterns();
      unsubAttendance();
      unsubQrTokens();
      unsubTasks();
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const unsub = onSnapshot(q, (snap) => setHasAdminAccount(!snap.empty));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user || null);
      setUserRole(null);
      setCurrentInternId(null);

      if (!user) return;

      try {
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        if (profileSnap.exists()) {
          const profile = profileSnap.data();
          if (profile?.role) setUserRole(profile.role);
          if (profile?.role === 'intern' && profile?.internId) {
            setCurrentInternId(profile.internId);
          }
        }
      } catch {
        // ignore profile lookup errors
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser || userRole) return;
    const email = authUser.email?.toLowerCase() || '';
    if (!email) return;

    const match = interns.find((i) => (i.email || '').toLowerCase() === email);
    if (!match) return;

    setUserRole('intern');
    setCurrentInternId(match.id);

    setDoc(
      doc(db, 'users', authUser.uid),
      { role: 'intern', email: authUser.email, internId: match.id, createdAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});

    updateDoc(doc(db, 'interns', match.id), { authUid: authUser.uid }).catch(() => {});
  }, [authUser, userRole, interns]);

  function mapAuthError(err) {
    const code = err?.code || '';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/user-not-found') return 'No account found for that email.';
    if (code === 'auth/wrong-password') return 'Incorrect password.';
    if (code === 'auth/email-already-in-use') return 'That email is already in use.';
    if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
    return err?.message || 'Authentication failed. Please try again.';
  }

  // -- Intern CRUD ----------------------------------------------------------

  const addIntern = useCallback(async (internData) => {
    const newIntern = {
      id: generateId(),
      name: internData.name.trim(),
      department: internData.department.trim(),
      email: internData.email.trim(),
      className: (internData.className || '').trim(),
      startDate: internData.startDate,
      notes: [],
      taskStatuses: {},
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'interns', newIntern.id), newIntern);
    return newIntern;
  }, []);

  const updateIntern = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'interns', id), updates);
  }, []);

  const deleteIntern = useCallback(async (id) => {
    await deleteDoc(doc(db, 'interns', id));

    const attendanceSnap = await getDocs(collection(db, 'attendance'));
    await Promise.all(
      attendanceSnap.docs.map((d) => {
        const data = d.data();
        const records = data.records || {};
        if (!records[id]) return Promise.resolve();
        return updateDoc(doc(db, 'attendance', d.id), { [`records.${id}`]: deleteField() });
      })
    );
  }, []);

  // -- Notes ----------------------------------------------------------------

  const addNote = useCallback(async (internId, noteText) => {
    const note = { id: generateId(), text: noteText.trim(), createdAt: new Date().toISOString() };
    const target = interns.find((i) => i.id === internId);
    const nextNotes = [...(target?.notes || []), note];
    await updateDoc(doc(db, 'interns', internId), { notes: nextNotes });
  }, [interns]);

  const deleteNote = useCallback(async (internId, noteId) => {
    const target = interns.find((i) => i.id === internId);
    const nextNotes = (target?.notes || []).filter((n) => n.id !== noteId);
    await updateDoc(doc(db, 'interns', internId), { notes: nextNotes });
  }, [interns]);

  // -- Attendance -----------------------------------------------------------

  const markAttendance = useCallback(async (internId, date, status) => {
    await setDoc(
      doc(db, 'attendance', date),
      { date, records: { [internId]: status } },
      { merge: true }
    );
  }, []);

  const getAttendanceStatus = useCallback(
    (internId, date) => attendance[date]?.[internId] || null,
    [attendance]
  );

  const getInternStats = useCallback((internId) => {
    let present = 0, absent = 0, late = 0, leave = 0, total = 0;
    Object.values(attendance).forEach((day) => {
      if (day[internId]) {
        total++;
        const s = day[internId];
        if (s === 'present') present++;
        else if (s === 'absent') absent++;
        else if (s === 'late') late++;
        else if (s === 'leave') leave++;
      }
    });
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present, absent, late, leave, total, attendanceRate };
  }, [attendance]);

  // Returns last N days of attendance for an intern as chart data
  const getInternAttendanceHistory = useCallback((internId, days = 14) => {
    const allDates = Object.keys(attendance).sort();
    const recent = allDates.slice(-days);
    return recent.map((date) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: attendance[date]?.[internId] || null,
      present: attendance[date]?.[internId] === 'present' || attendance[date]?.[internId] === 'late' ? 1 : 0,
    }));
  }, [attendance]);

  const getAttendanceDates = useCallback(
    () => Object.keys(attendance).sort((a, b) => b.localeCompare(a)),
    [attendance]
  );

  const getTodaySummary = useCallback(() => {
    const today = getTodayKey();
    const todayRecord = attendance[today] || {};
    let present = 0, absent = 0, late = 0, leave = 0, unmarked = 0;
    interns.forEach((intern) => {
      const s = todayRecord[intern.id];
      if (!s) unmarked++;
      else if (s === 'present') present++;
      else if (s === 'absent') absent++;
      else if (s === 'late') late++;
      else if (s === 'leave') leave++;
    });
    return { present, absent, late, leave, unmarked, total: interns.length };
  }, [attendance, interns]);

  // -- QR Tokens ------------------------------------------------------------

  const generateDailyToken = useCallback(async (date) => {
    const token = generateToken();
    const payload = { token, date, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'qrTokens', date), payload, { merge: true });
    return payload;
  }, []);

  const getDailyToken = useCallback((date) => qrTokens[date] || null, [qrTokens]);

  const markAttendanceByQr = useCallback((scannedToken, internId) => {
    const today = getTodayKey();
    const stored = qrTokens[today];
    if (!stored) return { success: false, message: 'No QR code generated for today.' };
    if (stored.token !== scannedToken) return { success: false, message: 'Invalid or expired QR code.' };
    if (attendance[today]?.[internId]) return { success: false, message: 'Attendance already marked for today.' };
    void markAttendance(internId, today, 'present');
    return { success: true, message: 'Attendance marked as Present!' };
  }, [qrTokens, attendance, markAttendance]);

  // -- Tasks ----------------------------------------------------------------

  // Admin assigns a task to an intern
  const assignTask = useCallback(async (internId, taskData) => {
    const task = {
      id: generateId(),
      internId,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      dueDate: taskData.dueDate || '',
      assignedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'tasks', task.id), task);
    return task;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  }, []);

  // Get tasks for a specific intern
  const getInternTasks = useCallback((internId) => {
    return Object.values(tasks).filter((t) => t.internId === internId);
  }, [tasks]);

  // Intern updates their own task status
  const updateTaskStatus = useCallback(async (internId, taskId, status) => {
    const target = interns.find((i) => i.id === internId);
    const nextStatuses = { ...(target?.taskStatuses || {}), [taskId]: status };
    await updateDoc(doc(db, 'interns', internId), { taskStatuses: nextStatuses });
  }, [interns]);

  // Get task status for an intern
  const getTaskStatus = useCallback((internId, taskId) => {
    const intern = interns.find((i) => i.id === internId);
    return intern?.taskStatuses?.[taskId] || 'not_started';
  }, [interns]);

  // -- Admin Auth ------------------------------------------------------------

  const registerAdmin = useCallback(async (email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(
        doc(db, 'users', cred.user.uid),
        { role: 'admin', email: cred.user.email, createdAt: new Date().toISOString() },
        { merge: true }
      );
      setUserRole('admin');
      setActiveView('dashboard');
      return { success: true };
    } catch (err) {
      return { success: false, message: mapAuthError(err) };
    }
  }, []);

  const loginAdmin = useCallback(async (name, password) => {
    if (name.trim() === 'Bharat' && password === 'aurora123') {
      // Bypass Firebase Auth entirely for the hardcoded admin
      setAuthUser({ email: 'bharat@admin.local', uid: 'admin-hardcoded' });
      setUserRole('admin');
      setActiveView('dashboard');
      return { success: true };
    } else {
      return { success: false, message: 'Invalid Admin Name or Password.' };
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    try { await signOut(auth); } catch(e) {}
    setAuthUser(null);
    setUserRole(null);
    setActiveView('dashboard');
  }, []);

  // Update check to allow our mock local authUser
  const isAdminLoggedIn = !!authUser && userRole === 'admin';

  // -- Intern Auth -----------------------------------------------------------

  const registerIntern = useCallback(async (email, password) => {
    const match = interns.find(
      (i) => (i.email || '').toLowerCase() === email.trim().toLowerCase()
    );
    if (!match) return { success: false, message: 'No intern profile found for this email.' };

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(
        doc(db, 'users', cred.user.uid),
        { role: 'intern', email: cred.user.email, internId: match.id, createdAt: new Date().toISOString() },
        { merge: true }
      );
      await updateDoc(doc(db, 'interns', match.id), { authUid: cred.user.uid });
      setUserRole('intern');
      setCurrentInternId(match.id);
      return { success: true, intern: match };
    } catch (err) {
      return { success: false, message: mapAuthError(err) };
    }
  }, [interns]);

  const loginIntern = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profileSnap = await getDoc(doc(db, 'users', cred.user.uid));

      if (profileSnap.exists() && profileSnap.data()?.role === 'intern') {
        const internId = profileSnap.data()?.internId || null;
        setUserRole('intern');
        setCurrentInternId(internId);
        return { success: true };
      }

      const match = interns.find(
        (i) => (i.email || '').toLowerCase() === (cred.user.email || '').toLowerCase()
      );
      if (!match) {
        await signOut(auth);
        return { success: false, message: 'No intern profile found for this email.' };
      }

      await setDoc(
        doc(db, 'users', cred.user.uid),
        { role: 'intern', email: cred.user.email, internId: match.id, createdAt: new Date().toISOString() },
        { merge: true }
      );
      await updateDoc(doc(db, 'interns', match.id), { authUid: cred.user.uid });

      setUserRole('intern');
      setCurrentInternId(match.id);
      return { success: true };
    } catch (err) {
      return { success: false, message: mapAuthError(err) };
    }
  }, [interns]);

  const logoutIntern = useCallback(async () => {
    await signOut(auth);
  }, []);

  const currentIntern = useMemo(() => (
    currentInternId ? interns.find((i) => i.id === currentInternId) || null : null
  ), [currentInternId, interns]);

  return (
    <AppContext.Provider value={{
      interns, attendance, qrTokens, tasks,
      activeView, setActiveView,
      addIntern, updateIntern, deleteIntern,
      addNote, deleteNote,
      markAttendance, getAttendanceStatus, getInternStats,
      getInternAttendanceHistory,
      getAttendanceDates, getTodaySummary,
      generateDailyToken, getDailyToken, markAttendanceByQr,
      assignTask, deleteTask, getInternTasks, updateTaskStatus, getTaskStatus,
      hasAdminAccount, loginAdmin, logoutAdmin, isAdminLoggedIn,
      adminEmail: authUser?.email || '',
      registerIntern, loginIntern, logoutIntern, currentIntern,
      isInternLoggedIn: !!authUser && userRole === 'intern',
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
}
