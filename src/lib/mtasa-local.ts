// Server-only local filesystem bridge for DATA_SOURCE=local mode.
// NEVER import this statically from client components — mtasa.ts loads it
// via dynamic import() only inside server-executed branches.
import fs from "node:fs";
import path from "node:path";

const LOCAL_MTA =
  process.env.LOCAL_MTA_PATH ||
  "C:\\Program Files (x86)\\MTA San Andreas 1.6\\server\\mods\\deathmatch";

const CMD_FILE = "/mods/deathmatch/resources/webadmin/webadmin_commands.json";

// Only allow paths inside the MTA deathmatch folder (traversal guard).
export function localPath(filePath: string): string | null {
  const m = /^\/mods\/deathmatch\/(.+)$/.exec(filePath);
  if (!m) return null;
  const rel = m[1].split("/").join(path.sep);
  const full = path.join(LOCAL_MTA, rel);
  const normalized = path.normalize(full);
  if (!normalized.startsWith(path.normalize(LOCAL_MTA) + path.sep)) return null;
  return normalized;
}

export async function readLocalFile(filePath: string): Promise<Uint8Array | null> {
  try {
    const p = localPath(filePath);
    if (!p) return null;
    const buf = await fs.promises.readFile(p);
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

export async function writeLocalFile(filePath: string, data: Uint8Array): Promise<boolean> {
  try {
    const p = localPath(filePath);
    if (!p) return false;
    await fs.promises.mkdir(path.dirname(p), { recursive: true });
    await fs.promises.writeFile(p, Buffer.from(data));
    return true;
  } catch (e) {
    console.error(`[mtasa-local] write failed for ${filePath}:`, e);
    return false;
  }
}

interface QueuedCommand {
  id: string;
  command: string;
  ts: number;
  processed?: boolean;
}

// Appends an admin console command to the queue file polled by
// webadmin/cmdqueue.lua on the game server (every ~2s).
export async function queueLocalCommand(command: string): Promise<boolean> {
  try {
    const existing = await readLocalFile(CMD_FILE);
    let queue: { commands: QueuedCommand[] } = { commands: [] };
    if (existing) {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(existing)) as {
          commands?: QueuedCommand[];
        };
        if (parsed && Array.isArray(parsed.commands)) {
          queue.commands = parsed.commands.filter((c) => !c.processed).slice(-49);
        }
      } catch {
        // corrupt file — start fresh
      }
    }
    queue.commands.push({
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      command,
      ts: Math.floor(Date.now() / 1000),
    });
    return writeLocalFile(CMD_FILE, new TextEncoder().encode(JSON.stringify(queue)));
  } catch (e) {
    console.error(`[mtasa-local] queue command failed:`, e);
    return false;
  }
}
