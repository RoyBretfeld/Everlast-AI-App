import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { writeFile, readFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY',
});

// §2 Revidierbarkeit: History für Soft-Delete
interface HistoryEntry {
    id: string;
    timestamp: string;
    transcript: string;
    enriched: string;
    deleted: boolean;
}

// §4 Menschliche Hoheit: User-Konfiguration
interface Config {
    model: string;
    systemPrompt: string;
    language: string;
    version: string;
}

const HISTORY_PATH = join(process.cwd(), 'data', 'history.json');
const CONFIG_PATH = join(process.cwd(), 'data', 'config.json');

const DEFAULT_CONFIG: Config = {
    model: 'llama-3.3-70b-versatile',
    systemPrompt: 'Du bist ein intelligenter Assistent, der gesprochenen Text in klare, strukturierte Notizen umwandelt. Formatiere die Ausgabe übersichtlich mit Aufzählungen oder Absätzen, wo sinnvoll. Korrigiere grammatikalische Fehler und füge fehlende Satzzeichen hinzu. Behalte den Kern der Aussage bei, verbessere aber Klarheit und Lesbarkeit.',
    language: 'de',
    version: '1.0.0'
};

async function loadConfig(): Promise<Config> {
    try {
        if (!existsSync(CONFIG_PATH)) {
            return DEFAULT_CONFIG;
        }
        const data = await readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return DEFAULT_CONFIG;
    }
}

async function loadHistory(): Promise<HistoryEntry[]> {
    try {
        if (!existsSync(HISTORY_PATH)) {
            return [];
        }
        const data = await readFile(HISTORY_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveToHistory(transcript: string, enriched: string): Promise<string> {
    const history = await loadHistory();

    const entry: HistoryEntry = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        transcript,
        enriched,
        deleted: false,
    };

    history.unshift(entry); // Neueste zuerst

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true });
    }

    await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
    return entry.id;
}

export async function POST(req: NextRequest) {
    let tempPath = '';
    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert Blob to File for Groq SDK
        const buffer = Buffer.from(await file.arrayBuffer());
        tempPath = join(tmpdir(), `upload_${Date.now()}.webm`);
        await writeFile(tempPath, buffer);

        // 1. Transcription via Groq Whisper
        const transcription = await groq.audio.transcriptions.create({
            file: require('fs').createReadStream(tempPath),
            model: 'whisper-large-v3',
            response_format: 'text',
        });

        // §4 Menschliche Hoheit: Load user config
        const config = await loadConfig();

        // 2. Enrichment via Groq Llama 3
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: config.systemPrompt,
                },
                {
                    role: 'user',
                    content: transcription as unknown as string,
                },
            ],
            model: config.model,
        });

        const enriched = chatCompletion.choices[0]?.message?.content || '';

        // §2 Revidierbarkeit: Log to history (Soft-Delete ready)
        const historyId = await saveToHistory(transcription as unknown as string, enriched);

        return NextResponse.json({
            id: historyId,
            transcript: transcription,
            enriched: enriched,
        });
    } catch (error: unknown) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (tempPath) {
            try {
                await unlink(tempPath);
            } catch { }
        }
    }
}
