import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 86400 * 7;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return secret;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64Encode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function base64Decode(str: string): string {
  return decodeURIComponent(
    Array.from(atob(str), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
  );
}

function generateRandomHex(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export async function createSessionToken(adminName?: string, adminRole?: string): Promise<string> {
  const secret = getSecret();
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    rnd: generateRandomHex(16),
    adminName: adminName || "",
    adminRole: adminRole || "Staff",
  });
  const signature = await hmacSign(payload, secret);
  return base64Encode(payload) + "." + signature;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = getSecret();
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const payload = base64Decode(parts[0]);
    const signature = parts[1];

    const expectedSignature = await hmacSign(payload, secret);
    if (signature !== expectedSignature) return false;

    const data = JSON.parse(payload);
    if (Date.now() > data.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function getAdminSession(): Promise<{ name: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = getSecret();
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const payload = base64Decode(parts[0]);
    const signature = parts[1];

    const expectedSignature = await hmacSign(payload, secret);
    if (signature !== expectedSignature) return null;

    const data = JSON.parse(payload);
    if (Date.now() > data.exp) return null;

    return {
      name: (data.adminName as string) || "",
      role: (data.adminRole as string) || "Staff",
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE };

const PLAYER_SESSION_COOKIE_NAME = "player_session";
const PLAYER_SESSION_MAX_AGE = 86400 * 7;

export async function createPlayerSession(accountName: string): Promise<string> {
  const secret = getSecret();
  const payload = JSON.stringify({
    type: "player",
    account: accountName,
    iat: Date.now(),
    exp: Date.now() + PLAYER_SESSION_MAX_AGE * 1000,
    rnd: generateRandomHex(16),
  });
  const signature = await hmacSign(payload, secret);
  return base64Encode(payload) + "." + signature;
}

export async function getPlayerSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLAYER_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = getSecret();
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const payload = base64Decode(parts[0]);
    const signature = parts[1];

    const expectedSignature = await hmacSign(payload, secret);
    if (signature !== expectedSignature) return null;

    const data = JSON.parse(payload);
    if (Date.now() > data.exp) return null;
    if (data.type !== "player") return null;

    return data.account as string;
  } catch {
    return null;
  }
}

export { PLAYER_SESSION_COOKIE_NAME, PLAYER_SESSION_MAX_AGE };

export async function requirePlayerAuth(req?: NextRequest): Promise<{ accountName: string } | null> {
  const accountName = await getPlayerSession();
  if (!accountName) return null;
  return { accountName };
}

export async function requireAdminAuth(req?: NextRequest): Promise<{ accountName: string; role: string } | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return { accountName: session.name, role: session.role };
}
