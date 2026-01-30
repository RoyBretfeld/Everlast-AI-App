'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, History, Trash2, MoreVertical, Settings, RotateCcw, X } from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: string;
  transcript: string;
  enriched: string;
  deleted: boolean;
}

interface Config {
  model: string;
  systemPrompt: string;
  language: string;
  version: string;
}

declare global {
  interface Window {
    electronAPI: {
      onHotkey: (callback: () => void) => void;
      minimizeApp: () => void;
      send: (channel: string) => void;
    }
  }
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Zum Aufnehmen klicken');
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [config, setConfig] = useState<Config>({
    model: 'llama-3.3-70b-versatile',
    systemPrompt: '',
    language: 'de',
    version: '1.0.0'
  });
  const [editedPrompt, setEditedPrompt] = useState('');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const analyser = useRef<AnalyserNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const isStopping = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);

  // Load history and config on mount
  useEffect(() => {
    loadHistory();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
      setEditedPrompt(data.systemPrompt);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const saveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: editedPrompt }),
      });
      setConfig(prev => ({ ...prev, systemPrompt: editedPrompt }));
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const resetToDefaults = async () => {
    try {
      const res = await fetch('/api/config', { method: 'POST' });
      const data = await res.json();
      setConfig(data.config);
      setEditedPrompt(data.config.systemPrompt);
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to reset config:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.entries) {
        setHistory(data.entries);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const deleteHistoryEntry = async (id: string) => {
    try {
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      loadHistory();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const selectHistoryEntry = (entry: HistoryEntry) => {
    setResult(entry.enriched || entry.transcript);
    setShowHistory(false);
  };

  useEffect(() => {
    // §1 Transparenz: Refined Electron detection
    const detectElectron = (): boolean => {
      if (typeof window === 'undefined') return false;
      // Check for Electron-specific APIs
      const hasElectronAPI = !!window.electronAPI;
      const hasElectronUserAgent = navigator.userAgent.toLowerCase().includes('electron');
      return hasElectronAPI || hasElectronUserAgent;
    };

    const hasElectron = detectElectron();
    setIsElectron(hasElectron);

    if (hasElectron) {
      setStatus('Ctrl+Alt+E drücken oder klicken zum Starten');
    } else {
      setStatus('Browser-Modus - Zum Aufnehmen klicken');
    }
  }, []);

  // Keep track of recording state for hotkey handler
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Register hotkey listener once on mount
  useEffect(() => {
    if (!isElectron) return;

    console.log('✓ Hotkey listener registered');
    window.electronAPI?.onHotkey(() => {
      console.log('Ctrl+Alt+E pressed! Currently recording:', isRecordingRef.current);
      if (isRecordingRef.current) {
        // Stop recording directly
        console.log('Stopping recording via hotkey...');
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
          mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
          if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
          }
          setIsRecording(false);
          setStatus('Wird verarbeitet...');
        }
      } else {
        // Start recording
        console.log('Starting recording via hotkey...');
        startRecording();
      }
    });
  }, [isElectron]);

  const toggleRecording = async () => {
    console.log('toggleRecording called, isRecording:', isRecording);
    if (isRecording) {
      console.log('Stopping recording...');
      stopRecording();
    } else {
      console.log('Starting recording...');
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // Setup silence detection
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);
      analyser.current = analyserNode;

      // Silence detection disabled - FFT threshold is unreliable for speech detection
      // User controls recording manually via Ctrl+Alt+E hotkey (much more reliable)
      // TODO: Implement RMS-based amplitude detection for better accuracy
      // const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      isStopping.current = false;
      mediaRecorder.current.start();
      setIsRecording(true);
      setStatus('Abhören...');
      setResult(null);
    } catch (err) {
      console.error("Error accessing microphone", err);
      setStatus('Mikrofon-Fehler');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      isStopping.current = true;
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

      // Cleanup audio context
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }

      setIsRecording(false);
      setStatus('Wird verarbeitet...');
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setCopied(false);
    try {
      const formData = new FormData();
      formData.append('file', blob);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data.enriched || data.transcript || 'No result found');
      setStatus(isElectron ? 'Bereit - Ctrl+Alt+E drücken' : 'Bereit - Klicken zum Aufnehmen');
      loadHistory(); // Refresh history after new entry
    } catch (err: any) {
      setResult(`Fehler: ${err.message || 'KI-Verarbeitung fehlgeschlagen'}`);
      setStatus('Fehler - Erneut versuchen');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const closeApp = () => {
    if (window.confirm('EVERLAST AI beenden?')) {
      window.close(); // Schließt das Fenster in Electron oder Browser
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="app-wrapper">
      {/* History Sidebar */}
      <aside className={`history-sidebar ${showHistory ? 'open' : ''}`}>
        <div className="sidebar-header">
          <History size={16} />
          <span>EINSATZPROTOKOLL</span>
          <button className="close-btn" onClick={() => setShowHistory(false)}>×</button>
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="no-history">KEINE EINTRÄGE GEFUNDEN</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-item-content" onClick={() => selectHistoryEntry(entry)}>
                  <span className="history-time">{formatTime(entry.timestamp)}</span>
                  <p className="history-preview">
                    {entry.transcript.slice(0, 50)}...
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(entry.id); }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-container">

        {/* Header Controls */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
          <button
            className="history-toggle"
            onClick={() => setShowHistory(!showHistory)}
            title="Log Access"
          >
            <History size={16} />
          </button>

          <h1>EVERLAST.AI</h1>

          {/* REC Indicator */}
          {isRecording && (
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '60px',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ff3333',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              animation: 'pulse 0.8s ease-in-out infinite'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: '#00f3ff',
                borderRadius: '50%',
                animation: 'pulse 0.8s ease-in-out infinite'
              }} />
              REC
            </div>
          )}

          <button
            className="settings-toggle"
            onClick={() => setShowMenu(!showMenu)}
            title="System Config"
          >
            <MoreVertical size={16} />
          </button>

          {/* Config Menu */}
          {showMenu && (
            <div className="settings-dropdown">
              <button onClick={() => { setShowSettings(true); setShowMenu(false); }}>
                <Settings size={14} />
                System-Parameter
              </button>
              <button onClick={() => { resetToDefaults(); setShowMenu(false); }}>
                <RotateCcw size={14} />
                Werkseinstellung
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Voice ORB Visualizer */}
        <div
          className={`orb-container ${isRecording || isProcessing ? 'active' : ''}`}
          onClick={toggleRecording}
        >
          <div className="orb-ring ring-1"></div>
          <div className="orb-ring ring-2"></div>
          <div className="orb-ring ring-3"></div>
          <div className="orb-core"></div>
        </div>

        <p className="status-text">{status}</p>

        {/* Holographic Result Plate */}
        {result && (
          <div className="result-area">
            <div className="result-header">
              <div className="result-title">
                <CheckCircle2 size={12} />
                DATEN_AUSGABE
              </div>
              <button
                className="copy-button"
                onClick={copyToClipboard}
                title="Daten kopieren"
              >
                {copied ? 'KOPIERT' : 'KOPIEREN'}
              </button>
            </div>
            <div className="result-content">
              {result}
            </div>
          </div>
        )}

        {/* Runtime Badge */}
        <div className="runtime-indicator">
          <span className={`runtime-badge ${isElectron ? 'electron' : 'browser'}`}>
            <span className="status-dot"></span>
            {isElectron ? 'SYSTEM ONLINE (v40.1)' : 'BROWSER-VERBINDUNG'}
          </span>
          {!isElectron && (
            <p className="browser-hint">
              HOTKEY-VERBINDUNG DEAKTIVIERT
            </p>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Settings size={18} />
                SYSTEM_PROMPT_KONFIGURATION
              </h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-banner">
                <strong>ℹ SYSTEM PROMPT:</strong> Passen Sie die KI-Anweisungen an. Die Änderungen werden lokal gespeichert und beeinflussen die Transkriptions-Verarbeitung.
              </div>
              <label>BEFEHLSSATZ:</label>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                placeholder="Verarbeitungslogik definieren..."
              />
              <p className="model-info">MODELL: {config.model}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>
                ABBRECHEN
              </button>
              <button className="btn-primary" onClick={saveConfig}>
                BESTÄTIGEN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Button - System Shutdown */}
      <div className="exit-container">
        <button
          className="exit-button"
          onClick={closeApp}
          title="App beenden"
        >
          SYSTEM_SHUTDOWN
        </button>
      </div>
    </main>
  );
}
