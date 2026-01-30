# 🔮 EVERLAST - Voice Intelligence

Everlast is a premium desktop application that transforms spoken words into structured, actionable intelligence. Designed for high-performance workflows, it leverages Groq's low-latency AI to provide near-instant transcription and enrichment.

---

## ⚠️ API-Key Hinweis

> **Der für die Bewertung hinterlegte API-Key ist ein temporärer Entwickler-Key.**
> Er ist aus Sicherheitsgründen auf eine **Gültigkeitsdauer von 14 Tagen** (bis zum **13. Februar 2026**) limitiert.
> Danach muss ein eigener [Groq-API-Key](https://console.groq.com/) in der `.env`-Datei hinterlegt werden.

---

## 🚀 The Problem
Modern professionals often have great ideas or meeting insights that get lost because the friction of typing them down is too high. Everlast removes this friction with a "Speak-to-Result" workflow activated by a single global hotkey.

## 🏗️ Architecture Overview

Everlast is built with a dual-layer architecture:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Shell** | Electron v40 | Desktop runtime, global hotkeys, window management |
| **Core** | Next.js 16 + React 19 | UI, API routes, state management |
| **Transcription** | Groq Whisper Large v3 | Ultra-fast speech-to-text |
| **Enrichment** | Groq Llama 3.3 70B Versatile | Intelligent text structuring |

### Tech Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **Desktop:** Electron 40.1.0
- **Transcription:** `whisper-large-v3` via Groq API
- **LLM:** `llama-3.3-70b-versatile` via Groq API
- **Styling:** Vanilla CSS (Glassmorphism Dark Theme)

## 🎨 Design Decisions
- **Glassmorphism UI**: A premium, translucent dark-mode aesthetic that feels at home on modern desktops.
- **Minimalist Workflow**: No complex menus. One button/hotkey to record, and the result is delivered instantly.
- **History & Soft-Delete**: Every processing event is logged to `data/history.json` for persistence and future retrieval.
- **Fast Transcription**: Chosen Groq Whisper over local models to ensure "WOW" speed without requiring a heavy GPU locally.

## 🔄 Hybrid Runtime Architecture (Robustness-Feature)

EVERLAST implements a **hybrid runtime model** that ensures maximum reliability:

| Mode | Activation | Features |
|------|------------|----------|
| **Desktop Mode** | `npm run dev` (Electron) | Full feature set incl. global hotkey `Alt+Shift+E` |
| **Browser Mode** | `http://localhost:3000` | Core features, click-to-record only |

**Why Hybrid?**
- **Graceful Degradation**: If Electron encounters issues (cache conflicts, binary mismatches), the app remains fully functional in Browser Mode.
- **Development Flexibility**: Developers can iterate on UI/API changes without restarting Electron.
- **Cross-Platform Safety**: Browser Mode works identically on Windows, macOS, and Linux.

**Runtime Detection (§1 Transparenz)**:
The app automatically detects its runtime environment and displays a visual indicator:
- 🟢 `Desktop Mode` - Full Electron environment active
- 🟡 `Browser Mode` - Web-only fallback active

All core features (Recording, Transcription, Enrichment, History, Settings) work identically in both modes via unified Next.js API routes.

## 🛠️ Setup & Installation
1.  **Clone the Repo**:
    ```bash
    git clone <repo-url>
    cd EVERLAST_AI
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    ```
4.  **Run Development Mode**:
    ```bash
    npm run dev
    ```
    *This starts the Next.js server and the Electron shell simultaneously.*

## ⌨️ Shortcuts
- `Alt+Shift+E`: Toggle Recording (Electron Mode only)
- `Click Mic`: Toggle Recording (Browser/Electron)

---

## 🛡️ Architektur-Standard: RB-Protokoll v3.0

Dieses Projekt wurde unter strikter Einhaltung des **RB-Protokolls v3.0** entwickelt. Jede Funktion folgt den vier Grundgesetzen der UX/UI-Integrität:

| Gesetz | Prinzip | Umsetzung |
|--------|---------|-----------|
| **§1 Transparenz** | Glass-Box | Pulsierender Mic-Indicator + Runtime-Badge (Desktop/Browser) |
| **§2 Revidierbarkeit** | Undo is King | `history.json` persistiert alle Transkriptionen (Soft-Delete) |
| **§3 Progressive Offenlegung** | Clean Default | Minimalistisches Interface, Settings-Modal bei Bedarf |
| **§4 Menschliche Hoheit** | User Control | Editierbarer System-Prompt in `config.json` |

**Entwicklungs-Methodik:** Die App wurde durch eine duale KI-Struktur (Lead Architect & Engineer) entworfen, um architektonische Fehlentscheidungen zu minimieren.

---

## 🔧 Troubleshooting

### Electron Binary-Cache Problem (Windows)

Falls Electron nicht startet (`app: undefined`), liegt möglicherweise ein Cache-Konflikt vor:

```powershell
# 1. Electron-Cache löschen
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron"

# 2. Node modules neu installieren
Remove-Item -Recurse -Force node_modules
npm install

# 3. Alternativ: Fix-Script ausführen
powershell -ExecutionPolicy Bypass -File scripts/clean_electron.ps1
```

### Browser-Modus (Fallback)

Die App funktioniert auch ohne Electron im Browser unter `http://localhost:3000`. Nur der globale Hotkey ist dann nicht verfügbar.

---

*Created as part of the Everlast AI Challenge.*
*Powered by Groq AI & the RB-Protocol v3.0*
