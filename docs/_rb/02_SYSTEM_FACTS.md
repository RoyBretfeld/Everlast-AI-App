# System Facts – EVERLAST AI

> 🚧 **Status:** Planning Phase  
> 📅 **Aktualisiert:** 2026-01-30  
> 🎯 **Konzept:** Voice Intelligence Desktop App (Everlast)
> 🐙 **Repo:** [github.com/RoyBretfeld/Everlast-AI-App](https://github.com/RoyBretfeld/Everlast-AI-App.git)

---

## Vision

**Everlast** – Eine intelligente Desktop-Anwendung, die Spracheingaben nahtlos in strukturierten Nutzwert verwandelt.

**Kernidee:**
- Aufnahme → Transkription → Enrichment (KI-Veredelung) in einem flüssigen Workflow.
- Aktivierung über globalen Hotkey für maximale Effizienz.
- Output: Zusammenfassungen, strukturierte Notizen oder formatierter Text.

---

## Tech Stack

| Kategorie | Entscheidung |
|-----------|--------------|
| **Framework** | Next.js (React) |
| **Desktop Runtime** | Electron |
| **Sprache** | TypeScript + JavaScript |
| **Styling** | Vanilla CSS (Modern, Premium Aesthetics) |
| **Transcription** | Groq Whisper (v3) / OpenAI Whisper |
| **LLM Integration** | Groq (Llama 3) / OpenAI (GPT-4) |
| **Hotkey** | Electron globalShortcut |

---

## Project Structure (Target)

```
___EVERLAST_AI_TASK/
├── src/                          # Next.js Frontend
│   ├── components/               # UI Components
│   ├── lib/                      # Logic (Recording, API)
│   └── styles/                   # Vanilla CSS Modules
├── main.js                       # Electron Main Process
├── docs/                         # Projekt-Dokumentation
│   └── _rb/                      # RB-Protocol Docs
├── .gitignore
└── README.md                     # Architektur & Setup (Final)
```

---

## Important Paths

- **Error DB (Central):** `E:\_____1111____Projekte-Programmierung\Antigravity\03_ERROR_DB.md`
- **RB Protocols:** `docs/_rb/`
- **HIVE Scripts:** `E:\_____1111____Projekte-Programmierung\Antigravity\__RB-Protokoll\scripts\`

---

## Critical Commands

```powershell
# RB Framework Check
python "E:\_____1111____Projekte-Programmierung\Antigravity\__RB-Protokoll\scripts\rb.py" check

# Pre-Commit Police (vor jedem Commit!)
python "E:\_____1111____Projekte-Programmierung\Antigravity\__RB-Protokoll\scripts\pre_commit_police.py"
```

---

## Goals (MVP)

1.  [ ] Global Hotkey zur App-Aktivierung.
2.  [ ] Native Voice Recording UI.
3.  [ ] Schnelle Transkription via API.
4.  [ ] Intelligentes Enrichment (Zusammenfassung/Formatierung).
5.  [ ] Export/Copy-to-Clipboard Funktionalität.
6.  [ ] High-End Design (Aesthetics Rule).

---

## Next Steps

- [ ] Next.js & Tauri Projekt initialisieren.
- [ ] Implementierung des Voice Pipelines.
- [ ] Integration der KI-Services.
- [ ] Finales Polishing & UX-Design.
