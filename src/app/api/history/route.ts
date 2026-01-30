import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// §2 Revidierbarkeit: History API für Soft-Delete
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

// GET: Alle History-Einträge abrufen (ohne gelöschte)
export async function GET() {
    try {
        const history = await loadHistory();
        // Filter out soft-deleted entries
        const activeEntries = history.filter(entry => !entry.deleted);
        return NextResponse.json({ entries: activeEntries });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE: Soft-Delete eines Eintrags (§2 Revidierbarkeit)
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const history = await loadHistory();
        const entryIndex = history.findIndex(entry => entry.id === id);

        if (entryIndex === -1) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        // Soft-delete: Mark as deleted instead of removing
        history[entryIndex].deleted = true;

        await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');

        return NextResponse.json({ success: true, id });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
