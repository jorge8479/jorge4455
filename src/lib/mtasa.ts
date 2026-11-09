// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require("sql.js");

const PANEL_URL = process.env.PTERODACTYL_URL || "https://panel.example.com";
const PANEL_KEY = process.env.PTERODACTYL_API_KEY || "";
const SERVER_UUID = process.env.PTERODACTYL_SERVER_UUID || "";

// DATA_SOURCE=local → read/write the MTA server directly from disk
// (local dev: website + game server on the same PC). Anything else → Pterodactyl.
const IS_LOCAL = (process.env.DATA_SOURCE || "pterodactyl") === "local";

type MtasaLocal = typeof import("./mtasa-local");
let localMod: MtasaLocal | null = null;

// mtasa.ts is server-graph-only (client code imports static data from
// mtasa-static.ts instead), so a plain dynamic import is safe here.
async function getLocal(): Promise<MtasaLocal> {
  if (!localMod) {
    localMod = await import("./mtasa-local");
  }
  return localMod;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-any, @typescript-eslint/no-explicit-any
let sqlPromise: Promise<any> | null = null;

async function getSql() {
  if (!sqlPromise) {
    const wasmResp = await fetch("https://sql.js.org/dist/sql-wasm.wasm", { cache: "force-cache" });
    const wasmBinary = new Uint8Array(await wasmResp.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    sqlPromise = initSqlJs({ wasmBinary });
  }
  return sqlPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const dbCache: { db: any; time: number; name: string }[] = [];
// Local reads are cheap disk reads — keep cache short so admin actions
// reflect quickly. Remote reads are slow HTTP downloads — cache longer.
const CACHE_TTL = IS_LOCAL ? 5_000 : 30_000;

export interface AclOverrides {
  overrides: Record<string, string>;
  history: { account: string; group: string; action: string; admin: string; timestamp: number }[];
}

let overridesCache: { data: AclOverrides; time: number } | null = null;
const OVERRIDES_CACHE_TTL = 10_000;

export async function readAclOverrides(): Promise<AclOverrides> {
  const now = Date.now();
  if (overridesCache && now - overridesCache.time < OVERRIDES_CACHE_TTL) {
    return overridesCache.data;
  }

  try {
    const data = await downloadFile("/mods/deathmatch/resources/nightucp/acl_overrides.json");
    if (!data) {
      const empty: AclOverrides = { overrides: {}, history: [] };
      return empty;
    }
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text) as Record<string, unknown>;

    // Handle Pterodactyl wrapper format: {"file":"...","content":"{...}"}
    let actual: Record<string, unknown> = parsed;
    if (typeof parsed.content === "string" && parsed.file) {
      try {
        actual = JSON.parse(parsed.content as string) as Record<string, unknown>;
      } catch {
        // not a wrapper, use as-is
      }
    }

    const result: AclOverrides = {
      overrides: (actual.overrides && typeof actual.overrides === "object" && !Array.isArray(actual.overrides))
        ? actual.overrides as Record<string, string>
        : {},
      history: Array.isArray(actual.history)
        ? actual.history as AclOverrides["history"]
        : [],
    };
    overridesCache = { data: result, time: now };
    return result;
  } catch {
    const empty: AclOverrides = { overrides: {}, history: [] };
    return empty;
  }
}

export async function writeAclOverrides(overrides: AclOverrides): Promise<boolean> {
  const json = JSON.stringify(overrides, null, 2);
  const data = new TextEncoder().encode(json);
  const ok = await uploadFile("/mods/deathmatch/resources/nightucp/acl_overrides.json", data);
  if (ok) {
    overridesCache = { data: overrides, time: Date.now() };
  }
  return ok;
}

function pteroHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${PANEL_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export function sanitizeAccountName(name: string): string | null {
  if (!name || typeof name !== "string") return null;
  const sanitized = name.replace(/[^a-zA-Z0-9_\-]/g, "");
  if (sanitized.length < 1 || sanitized.length > 32) return null;
  return sanitized;
}

export async function sendServerCommand(command: string): Promise<{ ok: boolean; error?: string }> {
  if (IS_LOCAL) {
    try {
      const local = await getLocal();
      const ok = await local.queueLocalCommand(command);
      return ok ? { ok: true } : { ok: false, error: "Failed to queue local command" };
    } catch (e) {
      console.error(`[mtasa] local sendCommand error:`, e);
      return { ok: false, error: "Local command error" };
    }
  }
  try {
    const res = await fetch(`${PANEL_URL}/api/client/servers/${SERVER_UUID}/command`, {
      method: "POST",
      headers: pteroHeaders(),
      body: JSON.stringify({ command }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "unknown");
      console.error(`[mtasa] sendCommand failed: ${res.status} ${err}`);
      return { ok: false, error: `Pterodactyl API error: ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error(`[mtasa] sendCommand error:`, e);
    return { ok: false, error: "Connection error" };
  }
}

export async function downloadFile(filePath: string): Promise<Uint8Array | null> {
  if (IS_LOCAL) {
    const local = await getLocal();
    return local.readLocalFile(filePath);
  }
  try {
    const downloadApiUrl = `${PANEL_URL}/api/client/servers/${SERVER_UUID}/files/download?file=${encodeURIComponent(filePath)}`;
    const res = await fetch(downloadApiUrl, {
      headers: {
        Authorization: `Bearer ${PANEL_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const errorBody = await res.text().catch(() => "unable to read body");
      console.error(`[mtasa] Download API failed: ${res.status} ${res.statusText} for ${filePath}`);
      console.error(`[mtasa] Response body: ${errorBody.substring(0, 500)}`);
      return null;
    }
    const json = await res.json();
    const url = json?.attributes?.url;
    if (!url) {
      console.error(`[mtasa] No signed URL in response for ${filePath}`, JSON.stringify(json).substring(0, 200));
      return null;
    }
    const dl = await fetch(url, { cache: "no-store" });
    if (!dl.ok) {
      console.error(`[mtasa] Binary download failed: ${dl.status}`);
      return null;
    }
    const buf = await dl.arrayBuffer();
    return new Uint8Array(buf);
  } catch (e) {
    console.error(`[mtasa] downloadFile error:`, e);
    return null;
  }
}

export async function uploadFile(filePath: string, data: Uint8Array): Promise<boolean> {
  if (IS_LOCAL) {
    const local = await getLocal();
    return local.writeLocalFile(filePath, data);
  }
  try {
    const text = new TextDecoder().decode(data);
    const res = await fetch(`${PANEL_URL}/api/client/servers/${SERVER_UUID}/files/write`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PANEL_KEY}`,
        Accept: "application/vnd.pterodactyl.v1+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: filePath, content: text }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "unknown");
      console.error(`[mtasa] Upload API failed: ${res.status} for ${filePath}: ${err}`);
      return false;
    }
    console.log(`[mtasa] Uploaded ${filePath} (${data.length} bytes)`);
    return true;
  } catch (e) {
    console.error(`[mtasa] uploadFile error:`, e);
    return false;
  }
}

// ACL XML parser — reads acl.xml directly from the server as source of truth
export interface AclXmlGroup {
  name: string;
  members: string[];
}

let aclXmlCache: { groups: AclXmlGroup[]; accountMap: Record<string, string>; time: number } | null = null;
const ACL_XML_CACHE_TTL = 30_000;

const ACL_GROUPS_WATCHED = [
  "AdminNighSide", "SuperModNighSide", "ModNighSide", "NightStaff",
  "NightPolicia", "Night911", "NightMecanico", "NightGang", "NightVIP",
];

export async function parseAclXml(): Promise<{ groups: AclXmlGroup[]; accountMap: Record<string, string> }> {
  const now = Date.now();
  if (aclXmlCache && now - aclXmlCache.time < ACL_XML_CACHE_TTL) {
    return aclXmlCache;
  }

  try {
    const data = await downloadFile("/mods/deathmatch/acl.xml");
    if (!data) {
      return { groups: [], accountMap: {} };
    }
    const text = new TextDecoder().decode(data);
    const groups: AclXmlGroup[] = [];
    const accountMap: Record<string, string> = {};

    // Parse all watched groups
    const groupRegex = /<group name="([^"]+)">([\s\S]*?)<\/group>/g;
    let groupMatch;
    while ((groupMatch = groupRegex.exec(text)) !== null) {
      const groupName = groupMatch[1];
      const groupBody = groupMatch[2];
      if (!ACL_GROUPS_WATCHED.includes(groupName)) continue;

      const members: string[] = [];
      const objRegex = /<object name="user\.([^"]+)"><\/object>/g;
      let objMatch;
      while ((objMatch = objRegex.exec(groupBody)) !== null) {
        const account = objMatch[1];
        members.push(account);
        accountMap[account] = groupName;
      }
      groups.push({ name: groupName, members });
    }

    // Now apply priority: highest priority group wins for each account
    // ACL_GROUPS_WATCHED is ordered from highest to lowest priority
    const finalAccountMap: Record<string, string> = {};
    for (const groupName of ACL_GROUPS_WATCHED) {
      const group = groups.find((g) => g.name === groupName);
      if (!group) continue;
      for (const account of group.members) {
        if (!finalAccountMap[account]) {
          finalAccountMap[account] = groupName;
        }
      }
    }

    aclXmlCache = { groups, accountMap: finalAccountMap, time: now };
    return { groups, accountMap: finalAccountMap };
  } catch (e) {
    console.error("[mtasa] parseAclXml error:", e);
    return { groups: [], accountMap: {} };
  }
}

export async function getAclFromXml(accountName: string): Promise<string> {
  const { accountMap } = await parseAclXml();
  return accountMap[accountName] || "";
}

export async function getAllFactionsForAccount(accountName: string): Promise<string[]> {
  const { groups } = await parseAclXml();
  const factions: string[] = [];
  for (const group of groups) {
    if (group.members.includes(accountName)) {
      factions.push(group.name);
    }
  }
  return factions;
}

export async function updatePlayerAcl(
  account: string,
  acl: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const overrides = await readAclOverrides();
    if (!overrides.overrides) overrides.overrides = {};
    if (!overrides.history) overrides.history = [];
    if (acl) {
      overrides.overrides[account] = acl;
    } else {
      delete overrides.overrides[account];
    }
    const ok = await writeAclOverrides(overrides);
    if (!ok) return { ok: false, error: "Failed to save override" };
    return { ok: true };
  } catch (e) {
    console.error(`[mtasa] updatePlayerAcl error:`, e);
    return { ok: false, error: String(e) };
  }
}

export async function logPermissionChange(
  account: string,
  groupId: string,
  action: string,
  adminAccount: string
): Promise<void> {
  try {
    const overrides = await readAclOverrides();
    if (!overrides.overrides) overrides.overrides = {};
    if (!overrides.history) overrides.history = [];
    overrides.history.unshift({
      account,
      group: groupId,
      action,
      admin: adminAccount,
      timestamp: Math.floor(Date.now() / 1000),
    });
    if (overrides.history.length > 200) overrides.history = overrides.history.slice(0, 200);
    await writeAclOverrides(overrides);
  } catch (e) {
    console.error(`[mtasa] logPermissionChange error:`, e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDb(name: string): Promise<any | null> {
  // Local mode reads the LIVE databases (nightucp's copies are stale mirrors).
  const dbPaths: Record<string, string> = IS_LOCAL
    ? {
        internal: "/mods/deathmatch/internal.db",
        levels: "/mods/deathmatch/resources/[ScriptActualizado]/(PD)Niveles/levels.db",
      }
    : {
        internal: "/mods/deathmatch/resources/nightucp/internal.db",
        levels: "/mods/deathmatch/resources/nightucp/levels.db",
      };

  const dbPath = dbPaths[name];
  if (!dbPath) {
    return null;
  }

  const now = Date.now();
  const cached = dbCache.find((c) => c.time > now - CACHE_TTL && c.name === name);
  if (cached) return cached.db;

  const data = await downloadFile(dbPath);
  if (!data) {
    console.error(`[mtasa] Failed to download ${name} database`);
    return null;
  }

  console.log(`[mtasa] Downloaded ${name}: ${data.length} bytes`);

  const SQL = await getSql();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const db = new SQL.Database(data);

  dbCache.push({ db, time: now, name });
  if (dbCache.length > 8) dbCache.shift();

  return db;
}

export interface MtaServerInfo {
  name: string;
  players: number;
  maxPlayers: number;
  uptime: string;
  mapName: string;
  gamemode: string;
  version: string;
  hostname: string;
  registered: number;
}

export interface MtaPlayer {
  rank: number;
  name: string;
  account: string;
  level: number;
  exp: number;
  playtime: number;
  minutes_played: number;
  money: number;
  skin: number;
  wantedLevel: number;
  acl: string;
  factions: string[];
}

export interface MtaPlayerDetail extends MtaPlayer {
  id: number;
  acl: string;
  lastLogin: string;
  coins: number;
  health: number;
  armor: number;
  bankBalance: number;
}

export interface MtaVehicle {
  id: number;
  model: number;
  name: string;
  plate: string;
  color1: number;
  color2: number;
  health: number;
  fuel: number;
  stored: number;
}

export interface MtaInventoryItem {
  itemId: number;
  name: string;
  type: string;
  amount: number;
  weight: number;
}

export interface MtaTopPlayers {
  byLevel: MtaPlayer[];
  byMoney: MtaPlayer[];
}

export interface MtaStaff {
  name: string;
  role: string;
}

import { ACL_MAP } from "./mtasa-static";

// Re-export client-safe statics for backwards compatibility.
export { ACL_MAP, getAclBadge, VEHICLE_MODELS, INVENTORY_ITEMS } from "./mtasa-static";
export type { AclConfig } from "./mtasa-static";

const STAFF: MtaStaff[] = [
  // Add your staff here — these names must match their in-game account names.
  // { name: "YourNick", role: "Owner" },
  // { name: "StaffNick", role: "Admin" },
  // { name: "HelperNick", role: "Moderator" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserDataValue(internalDB: any, accountName: string, key: string): string | null {
  try {
    const res = internalDB.exec(
      "SELECT u.value FROM userdata u JOIN accounts a ON a.id = u.userid WHERE a.name = ? AND u.key = ? LIMIT 1",
      [accountName, key]
    );
    if (res.length > 0 && res[0].values.length > 0) {
      return String(res[0].values[0][0]);
    }
  } catch {}
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserDataInt(internalDB: any, accountName: string, key: string): number {
  const val = getUserDataValue(internalDB, accountName, key);
  if (val) return parseInt(val, 10) || 0;
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPlayerRows(levelsDB: any): any[] {
  const res = levelsDB.exec(
    "SELECT account, name, level, exp, playtime, id, acl FROM sultana_levels ORDER BY level DESC, exp DESC"
  );
  if (res.length === 0) return [];
  const cols: string[] = res[0].columns;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    cols.forEach((c: string, i: number) => (obj[c] = row[i]));
    return obj;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildPlayerList(internalDB: any, rows: any[]): Promise<MtaPlayer[]> {
  const overrides = await readAclOverrides();
  const { accountMap } = await parseAclXml();
  return rows.map((row, i) => {
    const account = row.account || "";
    const acl = overrides.overrides[account] || accountMap[account] || row.acl || "";
    const playtime = row.playtime || 0;
    return {
      rank: i + 1,
      name: row.name || account,
      account,
      level: row.level || 1,
      exp: row.exp || 0,
      playtime,
      minutes_played: playtime,
      money: getUserDataInt(internalDB, account, "funmodev2-money"),
      skin: getUserDataInt(internalDB, account, "funmodev2-skin"),
      wantedLevel: getUserDataInt(internalDB, account, "funmodev2-wantedlevel"),
      acl,
      factions: acl ? [acl] : [],
    };
  });
}

export async function getMtaServerInfo(): Promise<MtaServerInfo | null> {
  try {
    const internalDB = await getDb("internal");
    if (!internalDB) return null;

    const countRes = internalDB.exec("SELECT COUNT(*) FROM accounts");
    const registered = countRes.length > 0 ? Number(countRes[0].values[0][0]) : 0;

    const levelsDB = await getDb("levels");
    let totalPlayers = 0;
    if (levelsDB) {
      const playerRes = levelsDB.exec("SELECT COUNT(*) FROM sultana_levels");
      totalPlayers = playerRes.length > 0 ? Number(playerRes[0].values[0][0]) : 0;
    }

    return {
      name: "NightSide Roleplay",
      players: totalPlayers,
      maxPlayers: parseInt(process.env.MTA_MAX_PLAYERS || "100"),
      uptime: "N/A",
      mapName: "San Andreas",
      gamemode: "Roleplay",
      version: "1.6.0",
      hostname: "NightSide Roleplay | Semi Roll | Version Oficial",
      registered,
    };
  } catch {
    return null;
  }
}

export async function getMtaPlayers(): Promise<MtaPlayer[] | null> {
  try {
    const levelsDB = await getDb("levels");
    const internalDB = await getDb("internal");
    if (!levelsDB || !internalDB) return null;

    const rows = getPlayerRows(levelsDB);
    return await buildPlayerList(internalDB, rows);
  } catch {
    return null;
  }
}

export async function getMtaTopPlayers(): Promise<MtaTopPlayers | null> {
  try {
    const levelsDB = await getDb("levels");
    const internalDB = await getDb("internal");
    if (!levelsDB || !internalDB) return null;

    const rows = getPlayerRows(levelsDB);
    const all = await buildPlayerList(internalDB, rows);

    const byLevel = all.slice(0, 10);
    const byMoney = [...all]
      .sort((a, b) => b.money - a.money)
      .slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    return { byLevel, byMoney };
  } catch {
    return null;
  }
}

export async function getMtaPlayer(name: string): Promise<MtaPlayerDetail | null> {
  try {
    const levelsDB = await getDb("levels");
    const internalDB = await getDb("internal");
    if (!levelsDB || !internalDB) return null;

    const res = levelsDB.exec(
      "SELECT account, name, level, exp, playtime, id, acl FROM sultana_levels WHERE name = ? OR account = ? LIMIT 1",
      [name, name]
    );
    if (res.length === 0 || res[0].values.length === 0) return null;

    const cols = res[0].columns;
    const row: any = {};
    cols.forEach((c: string, i: number) => (row[c] = res[0].values[0][i]));

    const account = row.account || "";
    const overrides = await readAclOverrides();
    const { accountMap } = await parseAclXml();
    const acl = overrides.overrides[account] || accountMap[account] || row.acl || "";

    let lastLogin = "N/A";
    if (row.id && row.id > 0) {
      try {
        const lr = internalDB.exec(
          "SELECT last_login_date FROM serialusage WHERE userid = ? ORDER BY last_login_date DESC LIMIT 1",
          [row.id]
        );
        if (lr.length > 0 && lr[0].values.length > 0) {
          const ts = Number(lr[0].values[0][0]);
          if (ts > 0) lastLogin = String(ts);
        }
      } catch {}
    }

    return {
      rank: 0,
      name: row.name || account,
      account,
      level: row.level || 1,
      exp: row.exp || 0,
      playtime: row.playtime || 0,
      minutes_played: row.playtime || 0,
      money: getUserDataInt(internalDB, account, "funmodev2-money"),
      skin: getUserDataInt(internalDB, account, "funmodev2-skin"),
      wantedLevel: getUserDataInt(internalDB, account, "funmodev2-wantedlevel"),
      coins: getUserDataInt(internalDB, account, "ns.coins"),
      health: getUserDataInt(internalDB, account, "funmodev2-health"),
      armor: getUserDataInt(internalDB, account, "funmodev2-armor"),
      id: row.id || 0,
      acl,
      factions: await getAllFactionsForAccount(account),
      lastLogin,
      bankBalance: getUserDataInt(internalDB, account, "money"),
    };
  } catch {
    return null;
  }
}

export async function getMtaStaff(): Promise<MtaStaff[] | null> {
  return STAFF;
}

export interface PermissionLog {
  id: number;
  target_account: string;
  action: string;
  permission: string;
  admin_account: string;
  created_at: number;
}

export interface AclGroupInfo {
  id: string;
  label: string;
  color: string;
  bg: string;
  members: { account: string; name: string; level: number }[];
}

export async function getPermissionLogs(limit = 50): Promise<PermissionLog[]> {
  try {
    const overrides = await readAclOverrides();
    return overrides.history.slice(0, limit).map((entry, i) => ({
      id: i + 1,
      target_account: entry.account,
      action: entry.action,
      permission: entry.group,
      admin_account: entry.admin,
      created_at: entry.timestamp,
    }));
  } catch {
    return [];
  }
}

// Map lowercase ACL values to their Night-prefix equivalents
const ACL_LOWERCASE_MAP: Record<string, string> = {
  policia: "NightPolicia",
  samu: "Night911",
  mecanico: "NightMecanico",
  gang: "NightGang",
  vip: "NightVIP",
};

export async function getAllAclGroups(): Promise<AclGroupInfo[]> {
  try {
    const [aclData, levelsDB, overrides] = await Promise.all([
      parseAclXml(),
      getDb("levels"),
      readAclOverrides(),
    ]);

    const groups: AclGroupInfo[] = [];
    const seen = new Set<string>();

    // Build a map of account -> player info from levels.db
    const playerInfo: Record<string, { name: string; level: number }> = {};
    if (levelsDB) {
      const res = levelsDB.exec(
        "SELECT account, name, level FROM sultana_levels"
      );
      if (res.length > 0) {
        const cols: string[] = res[0].columns;
        res[0].values.forEach((row: any[]) => {
          const obj: any = {};
          cols.forEach((c: string, i: number) => (obj[c] = row[i]));
          playerInfo[obj.account] = { name: obj.name, level: obj.level };
        });
      }
    }

    // Build groups from acl.xml data
    for (const xmlGroup of aclData.groups) {
      if (seen.has(xmlGroup.name)) continue;
      seen.add(xmlGroup.name);

      const config = ACL_MAP[xmlGroup.name] || { label: xmlGroup.name, color: "#6b7280", bg: "rgba(107,114,128,0.15)" };
      const members: { account: string; name: string; level: number }[] = [];

      for (const account of xmlGroup.members) {
        const info = playerInfo[account];
        members.push({
          account,
          name: info?.name || account,
          level: info?.level || 0,
        });
      }

      groups.push({
        id: xmlGroup.name,
        label: config.label,
        color: config.color,
        bg: config.bg,
        members,
      });
    }

    // Add override players not in any xml group
    for (const [account, acl] of Object.entries(overrides.overrides)) {
      if (aclData.accountMap[account]) continue;
      if (!seen.has(acl)) continue;
      const config = ACL_MAP[acl];
      if (!config) continue;
      const existing = groups.find((g) => g.id === acl);
      if (existing) {
        const info = playerInfo[account];
        existing.members.push({
          account,
          name: info?.name || account,
          level: info?.level || 0,
        });
      }
    }

    return groups;
  } catch {
    return [];
  }
}

export function getStaffRoleByName(accountName: string): string | null {
  const member = STAFF.find((s) => s.name === accountName);
  return member ? member.role : null;
}

export function canManageAclGroup(adminRole: string | null, group: string): boolean {
  if (!adminRole) return false;
  if (adminRole === "Owner" || adminRole === "Admin") return true;
  if (adminRole === "Moderator") {
    const allowed = ["NightStaff", "NightPolicia", "Night911", "NightMecanico", "NightGang", "NightVIP"];
    return allowed.includes(group);
  }
  return false;
}

export function getAllAclGroupIds(): string[] {
  return Object.keys(ACL_MAP).filter(
    (k) => k !== "vip" && k !== "policia" && k !== "samu" && k !== "mecanico" && k !== "gang"
  );
}

export interface LiveServerStatus {
  online: boolean;
  serverName: string;
  playerCount: number;
  maxPlayers: number;
  uptime: string;
  uptimeSeconds: number;
  timestamp: number;
  gamemode: string;
  mapName: string;
  version: string;
}

export interface LivePlayer {
  id: number;
  name: string;
  account: string;
  health: number;
  armor: number;
  level: number;
  exp: number;
  money: number;
  skin: number;
  wantedLevel: number;
  faction: string;
  team: string;
  x: number;
  y: number;
  z: number;
  interior: number;
  dimension: number;
}

export interface LivePlayersData {
  count: number;
  players: LivePlayer[];
  timestamp: number;
}

export interface ServerLogEntry {
  type: string;
  account: string;
  player: string;
  details: string;
  timestamp: number;
}

export interface ServerLogsData {
  count: number;
  logs: ServerLogEntry[];
  timestamp: number;
}

export async function getLiveServerStatus(): Promise<LiveServerStatus | null> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/status.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.online !== undefined) {
        return {
          online: parsed.online,
          serverName: parsed.serverName || "NightSide Roleplay",
          playerCount: parsed.playerCount || 0,
          maxPlayers: parsed.maxPlayers || 100,
          uptime: parsed.uptime || "N/A",
          uptimeSeconds: parsed.uptimeSeconds || 0,
          timestamp: parsed.timestamp || 0,
          gamemode: parsed.gamemode || "Roleplay",
          mapName: parsed.mapName || "San Andreas",
          version: parsed.version || "1.6.0",
        };
      }
    }
  } catch (e) {
    console.error("[mtasa] getLiveServerStatus failed:", e);
  }

  try {
    const internalDB = await getDb("internal");
    if (internalDB) {
      return { online: true, serverName: "NightSide Roleplay | Semi Roll", playerCount: 0, maxPlayers: 100, uptime: "N/A", uptimeSeconds: 0, timestamp: Math.floor(Date.now() / 1000), gamemode: "Roleplay", mapName: "San Andreas", version: "1.6.0" };
    }
  } catch (e) {
    console.error("[mtasa] getLiveServerStatus DB fallback failed:", e);
  }

  return { online: false, serverName: "NightSide Roleplay | Semi Roll", playerCount: 0, maxPlayers: 100, uptime: "N/A", uptimeSeconds: 0, timestamp: 0, gamemode: "Roleplay", mapName: "San Andreas", version: "1.6.0" };
}

export async function getLivePlayers(): Promise<LivePlayersData | null> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/players.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.players) {
        const players: LivePlayer[] = parsed.players.map((p: any) => ({
          id: p.id || 0,
          name: p.name || "unknown",
          account: p.account || "unknown",
          health: p.health || 0,
          armor: p.armor || 0,
          level: p.level || 1,
          exp: p.exp || 0,
          money: p.money || 0,
          skin: p.skin || 0,
          wantedLevel: p.wantedLevel || 0,
          faction: p.faction || "None",
          team: p.team || "None",
          x: p.x || 0,
          y: p.y || 0,
          z: p.z || 0,
          interior: p.interior || 0,
          dimension: p.dimension || 0,
        }));
        return { count: players.length, players, timestamp: parsed.timestamp || Math.floor(Date.now() / 1000) };
      }
    }
  } catch (e) {
    console.error("[mtasa] getLivePlayers failed:", e);
  }
  return { count: 0, players: [], timestamp: Math.floor(Date.now() / 1000) };
}

export async function getServerLogs(): Promise<ServerLogsData | null> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/log.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.logs) {
        return { count: parsed.count || 0, logs: parsed.logs || [], timestamp: parsed.timestamp || 0 };
      }
    }
  } catch {}
  return { count: 0, logs: [], timestamp: Math.floor(Date.now() / 1000) };
}
