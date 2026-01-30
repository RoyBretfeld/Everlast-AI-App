# 🔮 EVERLAST - Voice Intelligence App

Everlast is a premium desktop application that transforms spoken words into structured, actionable intelligence. Designed for high-performance workflows, it leverages Groq's low-latency AI to provide near-instant transcription and enrichment.

---

## 🔑 Getting Your Own API Key

EVERLAST requires a **Groq API Key** for transcription and AI enrichment. The key is **free** and takes 2 minutes to set up:

### Step 1: Get Your Groq API Key
1. Visit [console.groq.com](https://console.groq.com/keys)
2. Sign up (free account)
3. Create a new API key
4. Copy the key

### Step 2: Add to Your Local `.env`
Create a `.env` file in the project root:
```env
GROQ_API_KEY=gsk_your_key_here
```

**⚠️ IMPORTANT:**
- `.env` is **never committed** to the repository (protected by `.gitignore`)
- Each developer/tester must get their own free API key
- The key is stored locally on your machine only
- See `.env.example` for the template

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

### Prerequisites
- Node.js 18+ installed
- A free Groq API Key (see "Getting Your Own API Key" above)

### Installation Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RoyBretfeld/Everlast-AI-App.git
   cd Everlast-AI-App
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Your API Key**:
   Copy `.env.example` to `.env` and add your Groq API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your Groq API key
   ```

4. **Start the Application**:
   ```bash
   npm run dev
   ```
   This starts:
   - Next.js dev server on `http://localhost:3000`
   - Electron shell (desktop app)

5. **Use the App**:
   - **Desktop Mode**: Press `Ctrl+Alt+E` to start recording
   - **Browser Mode** (fallback): Click the mic icon at `http://localhost:3000`

## ⌨️ Keyboard Shortcuts
| Action | Shortcut | Mode |
|--------|----------|------|
| **Start/Stop Recording** | `Ctrl+Alt+E` | Desktop (Electron) only |
| **Click Recording Button** | Mouse click | Desktop + Browser |
| **Copy Result** | Button click | Both modes |
| **Exit Application** | Button click | Both modes |

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

### "GROQ_API_KEY not found" Error
**Solution**: Make sure your `.env` file exists in the project root with a valid Groq API key:
```bash
ls -la .env  # Check if file exists
cat .env     # Verify the key is there
```

### Electron Won't Start
**Solution**: Try the Browser Mode fallback:
```bash
# Stop the current process (Ctrl+C)
# Then open: http://localhost:3000 in your browser
```

The app works fine without Electron! You just won't have the `Ctrl+Alt+E` global hotkey.

### Microphone Permission Denied
**Solution**:
- Windows: Check app permissions in Settings > Privacy & Security > Microphone
- macOS: Grant microphone access when prompted
- Linux: Check ALSA/PulseAudio permissions

### Browser Mode Only (No Electron)
That's fine! The app has a **hybrid runtime model**:
- All core features work in browser mode
- Only the global hotkey (`Ctrl+Alt+E`) requires Electron
- Just click the mic button to start recording

---

---

## 📊 Project Status
- ✅ MVP Complete: Hotkey + Recording + Transcription + Enrichment + History + Clean Exit
- ✅ Security: API keys removed, `.env` protected
- ✅ Deployment Ready: Build passes, remote synced

## 🤝 Contributing
1. Get your own Groq API key (see setup above)
2. Create a `.env` file locally (never commit it)
3. Make your changes
4. Test in both Desktop and Browser modes
5. Submit PR

## 📝 License
MIT License - See LICENSE file for details

---

*Created as part of the EVERLAST AI Project.*
*Powered by Groq AI & the RB-Protocol v3.0*
