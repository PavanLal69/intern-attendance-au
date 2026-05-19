import { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, XCircle, User, Building2, GraduationCap } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { getTodayKey, formatDate } from '../utils/storage';
import './ScanPage.css';

// Extract token from a QR value — supports both raw token and URL with ?scan=TOKEN
function extractToken(raw) {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const param = url.searchParams.get('scan');
    if (param) return param.trim().toUpperCase();
  } catch {
    // not a URL — treat as raw token
  }
  return raw.trim().toUpperCase();
}

export default function ScanPage() {
  const { markAttendanceByQr, getDailyToken, currentIntern, isInternLoggedIn, setActiveView } = useApp();
  const today = getTodayKey();
  const tokenData = getDailyToken(today);

  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState(null); // { success, message }
  const [autoMarking, setAutoMarking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  // Pre-fill token from URL ?scan=TOKEN (when intern scans QR and lands here)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('scan');
    if (urlToken) {
      setManualToken(urlToken.toUpperCase());
      // Clean the URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Start camera scanner
  async function startScanner() {
    setCameraError('');
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerInstanceRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const token = extractToken(decodedText);
          setManualToken(token);
          stopScanner();
        },
        () => {} // ignore per-frame errors
      );
    } catch (err) {
      setCameraError('Camera access denied or not available. Enter the token manually.');
      setScanning(false);
    }
  }

  async function stopScanner() {
    try {
      if (scannerInstanceRef.current) {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current = null;
      }
    } catch {
      // ignore
    }
    setScanning(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  useEffect(() => {
    if (!isInternLoggedIn || !currentIntern) return;
    if (!manualToken.trim() || result || autoMarking) return;

    setAutoMarking(true);
    const res = markAttendanceByQr(manualToken.trim().toUpperCase(), currentIntern.id);
    setResult(res);
    setAutoMarking(false);
  }, [isInternLoggedIn, currentIntern, manualToken, result, autoMarking, markAttendanceByQr]);

  function handleReset() {
    setResult(null);
    setManualToken('');
  }

  return (
    <div className="scan-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <QrCode size={26} /> Scan QR Code
          </h1>
          <p className="page-subtitle">
            Scan today's QR code to mark your attendance — {formatDate(today)}
          </p>
        </div>
      </div>

      {!tokenData && (
        <GlassCard className="no-qr-notice">
          <XCircle size={20} color="#ef4444" />
          <p>No QR code has been generated for today. Ask your admin to generate one.</p>
        </GlassCard>
      )}

      {result ? (
        <GlassCard className={`result-card ${result.success ? 'success' : 'failure'}`}>
          <div className="result-icon">
            {result.success
              ? <CheckCircle size={56} color="#10b981" />
              : <XCircle size={56} color="#ef4444" />}
          </div>
          <h2 className="result-title">{result.success ? 'Attendance Marked!' : 'Failed'}</h2>
          <p className="result-message">{result.message}</p>
          {result.success && currentIntern && (
            <div className="result-details" style={{ marginTop: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <p><strong>Name:</strong> {currentIntern.name}</p>
              <p><strong>Department:</strong> {currentIntern.department}</p>
              {currentIntern.className && <p><strong>Class:</strong> {currentIntern.className}</p>}
              <p><strong>Token:</strong> {manualToken}</p>
            </div>
          )}
          <button className="btn-primary" onClick={handleReset} style={{ marginTop: '1.5rem' }}>
            {result.success ? 'Done' : 'Try Again'}
          </button>
        </GlassCard>
      ) : (
        <div className="scan-layout">
          {/* Camera Scanner */}
          <GlassCard className="camera-card">
            <h2 className="section-title">Camera Scan</h2>
            <p className="section-sub">Point your camera at the QR code</p>

            <div id="qr-reader" ref={scannerRef} className="qr-reader-box" />

            {cameraError && <p className="camera-error">{cameraError}</p>}

            <div className="camera-actions">
              {!scanning ? (
                <button className="btn-primary" onClick={startScanner}>
                  <QrCode size={16} /> Start Camera
                </button>
              ) : (
                <button className="btn-outline" onClick={stopScanner}>
                  Stop Camera
                </button>
              )}
            </div>

            {manualToken && (
              <div className="scanned-token">
                <span className="scanned-label">Scanned token:</span>
                <span className="scanned-value">{manualToken}</span>
              </div>
            )}
          </GlassCard>

          {/* Intern Details + Auto Mark */}
          <GlassCard className="manual-card">
            <h2 className="section-title">Attendance Details</h2>
            <p className="section-sub">Your attendance is recorded automatically</p>

            {!isInternLoggedIn || !currentIntern ? (
              <div className="scan-auth-card">
                <p>Please sign in to your intern account to mark attendance.</p>
                <button className="btn-primary" onClick={() => setActiveView('intern-portal')}>
                  Go to Intern Portal
                </button>
              </div>
            ) : (
              <div className="scan-details-card">
                <div className="details-grid">
                  <div className="detail-item">
                    <User size={14} />
                    <span>{currentIntern.name}</span>
                  </div>
                  <div className="detail-item">
                    <Building2 size={14} />
                    <span>{currentIntern.department}</span>
                  </div>
                  {currentIntern.className && (
                    <div className="detail-item">
                      <GraduationCap size={14} />
                      <span>{currentIntern.className}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <QrCode size={14} />
                    <span className="token-pill">{manualToken || 'No token yet'}</span>
                  </div>
                </div>

                <div className="auto-status">
                  {autoMarking && <span>Marking attendance...</span>}
                  {!autoMarking && manualToken && <span>Attendance will be marked immediately.</span>}
                  {!manualToken && <span>Scan the QR code to continue.</span>}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
