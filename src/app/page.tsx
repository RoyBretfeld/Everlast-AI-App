'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';

declare global {
  interface Window {
    electronAPI: {
      onHotkey: (callback: () => void) => void;
      minimizeApp: () => void;
    }
  }
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click to Start Recording');
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [copied, setCopied] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    // Detect Electron environment
    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI;
    setIsElectron(hasElectron);

    if (hasElectron) {
      setStatus('Press Alt+Shift+E or Click to Start');
      // Listen for Electron Hotkey
      window.electronAPI.onHotkey(() => {
        toggleRecording();
      });
    } else {
      setStatus('Browser Mode - Click to Record');
    }
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setStatus('Listening...');
      setResult(null);
    } catch (err) {
      console.error("Error accessing microphone", err);
      setStatus('Microphone Error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setStatus('Processing...');
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
      setStatus(isElectron ? 'Ready - Press Alt+Shift+E' : 'Ready - Click to Record Again');
    } catch (err: any) {
      setResult(`Error: ${err.message || 'AI Processing Failed'}`);
      setStatus('Error - Try Again');
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

  return (
    <main className="app-container">
      <div className="content">
        <h1>EVERLAST</h1>

        <div
          className={`recording-indicator ${isRecording ? 'active' : ''}`}
          onClick={toggleRecording}
        >
          {isRecording ? (
            <Square size={32} fill="white" />
          ) : isProcessing ? (
            <Loader2 size={32} className="animate-spin" />
          ) : (
            <Mic size={32} fill="white" />
          )}
        </div>

        <p className="status-text">{status}</p>

        {result && (
          <div className="result-area">
            <div className="result-header">
              <div className="result-title">
                <CheckCircle2 size={12} />
                Processed Result
              </div>
              <button
                className="copy-button"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="result-content">
              {result}
            </div>
          </div>
        )}

        {!isElectron && (
          <p className="browser-hint">
            Running in Browser Mode. For hotkey support, run as Electron app.
          </p>
        )}
      </div>
    </main>
  );
}
