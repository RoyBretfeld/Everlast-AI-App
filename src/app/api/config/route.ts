import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// §4 Menschliche Hoheit: User-Konfiguration
interface Config {
    model: string;
    systemPrompt: string;
    language: string;
    version: string;
}

const CONFIG_PATH = join(process.cwd(), 'data', 'config.json');

const DEFAULT_CONFIG: Config = {
    model: 'llama-3.3-70b-versatile',
    systemPrompt: 'Du bist der Everlast Intelligence Core. Struktur-Regel: Nutze kurze Absätze, klare Bulletpoints und Trennlinien (---) zwischen den Sektionen 🎯 KERN, 📝 ANALYSE und 🛠️ ACTIONS. Das verhindert Textwüsten und verbessert die Lesbarkeit beim Scrollen.',
    language: 'de',
    version: '1.0.0'
};

async function loadConfig(): Promise<Config> {
    try {
        if (!existsSync(CONFIG_PATH)) {
            // Create default config if not exists
            const dataDir = join(process.cwd(), 'data');
            if (!existsSync(dataDir)) {
                await mkdir(dataDir, { recursive: true });
            }
            await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
            return DEFAULT_CONFIG;
        }
        const data = await readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return DEFAULT_CONFIG;
    }
}

// GET: Konfiguration abrufen
export async function GET() {
    try {
        const config = await loadConfig();
        return NextResponse.json(config);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// PUT: Konfiguration aktualisieren
export async function PUT(req: NextRequest) {
    try {
        const updates = await req.json();
        const currentConfig = await loadConfig();

        const newConfig: Config = {
            ...currentConfig,
            ...updates,
            version: currentConfig.version // Preserve version
        };

        await writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');

        return NextResponse.json({ success: true, config: newConfig });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// POST: Werkseinstellungen wiederherstellen (§2 Revidierbarkeit)
export async function POST() {
    try {
        await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
        return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
