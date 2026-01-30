# 🔮 EVERLAST - Voice Intelligence

Everlast is a premium desktop application that transforms spoken words into structured, actionable intelligence. Designed for high-performance workflows, it leverages Groq's low-latency AI to provide near-instant transcription and enrichment.

## 🚀 The Problem
Modern professionals often have great ideas or meeting insights that get lost because the friction of typing them down is too high. Everlast removes this friction with a "Speak-to-Result" workflow activated by a single global hotkey.

## 🏗️ Architecture Overview
Everlast is built with a dual-layer architecture:
- **Shell**: **Electron** provides the desktop foundation, handling systems-level features like global hotkeys (`Alt+Shift+E`), window transparency, and microphone permissions.
- **Core**: **Next.js (React)** powers the UI and the AI pipeline.
- **Brain**: **Groq AI** (Whisper-v3 & Llama 3) handles the heavy lifting of audio transcription and intelligent text enrichment.

## 🎨 Design Decisions
- **Glassmorphism UI**: A premium, translucent dark-mode aesthetic that feels at home on modern desktops.
- **Minimalist Workflow**: No complex menus. One button/hotkey to record, and the result is delivered instantly.
- **History & Soft-Delete**: Every processing event is logged to `data/history.json` for persistence and future retrieval.
- **Fast Transcription**: Chosen Groq Whisper over local models to ensure "WOW" speed without requiring a heavy GPU locally.

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
*Created as part of the Everlast AI Challenge.*
