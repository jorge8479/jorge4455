import { downloadFile } from "./mtasa";

interface UcpCodeEntry {
  code: string;
  created_at: number;
}

interface UcpCodesFile {
  [accountName: string]: UcpCodeEntry;
}

let ucpCodesCache: { data: UcpCodesFile; time: number } | null = null;
const UCP_CODES_CACHE_TTL = 5_000;

async function readUcpCodesJson(): Promise<UcpCodesFile> {
  const now = Date.now();
  if (ucpCodesCache && now - ucpCodesCache.time < UCP_CODES_CACHE_TTL) {
    return ucpCodesCache.data;
  }

  try {
    const data = await downloadFile("/mods/deathmatch/resources/nightucp/ucp_codes.json");
    if (!data) return {};

    const text = new TextDecoder().decode(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Handle Pterodactyl wrapper: {"file":"...","content":"{...}"}
      const wrapper = JSON.parse(text) as Record<string, unknown>;
      if (typeof wrapper.content === "string" && wrapper.file) {
        parsed = JSON.parse(wrapper.content as string);
      } else {
        return {};
      }
    }

    // MTA toJSON wraps objects in an array: [{"account":{...}}]
    let actual: Record<string, unknown>;
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
      actual = parsed[0] as Record<string, unknown>;
    } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      actual = parsed as Record<string, unknown>;
    } else {
      return {};
    }

    const result: UcpCodesFile = {};
    for (const [key, val] of Object.entries(actual)) {
      if (typeof val === "object" && val !== null && "code" in val && "created_at" in val) {
        result[key] = val as UcpCodeEntry;
      }
    }

    ucpCodesCache = { data: result, time: now };
    return result;
  } catch {
    return {};
  }
}

export async function verifyUcpCode(code: string): Promise<string | null> {
  try {
    const codes = await readUcpCodesJson();
    const now = Math.floor(Date.now() / 1000);

    for (const [accountName, entry] of Object.entries(codes)) {
      if (entry.code === code) {
        if (now - entry.created_at <= 300) {
          return accountName;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
