import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { writeFile, readFile, mkdir } from 'fs/promises';
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

const HISTORY_PATH = join(process.cwd(), 'data', 'history.json');

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
    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert Blob to File for Groq SDK
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempPath = join(tmpdir(), `upload_${Date.now()}.webm`);
        await writeFile(tempPath, buffer);

        // 1. Transcription via Groq Whisper
        const transcription = await groq.audio.transcriptions.create({
            file: require('fs').createReadStream(tempPath),
            model: 'whisper-large-v3',
            response_format: 'text',
        });

        // 2. Enrichment via Groq Llama 3
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an intelligent assistant. Enrich the following transcription. Format it as a structured note, summary, or action list dependending on the content. Be concise and professional.',
                },
                {
                    role: 'user',
                    content: transcription as string,
                },
            ],
            model: 'llama3-8b-8192',
        });

        const enriched = chatCompletion.choices[0]?.message?.content || '';

        // §2 Revidierbarkeit: Log to history (Soft-Delete ready)
        const historyId = await saveToHistory(transcription as string, enriched);

        return NextResponse.json({
            id: historyId,
            transcript: transcription,
            enriched: enriched,
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
