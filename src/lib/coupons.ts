import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface CouponRedemption {
  couponId: string;
  couponCode: string;
  account: string;
  discountPercent: number;
  redeemedAt: string;
}

const DATA_DIR = join(process.cwd(), "data");
const COUPONS_FILE = join(DATA_DIR, "coupons.json");
const REDEMPTIONS_FILE = join(DATA_DIR, "redemptions.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!existsSync(file)) return fallback;
    const raw = readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  ensureDir();
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export function getCoupons(): Coupon[] {
  return readJson<Coupon[]>(COUPONS_FILE, []);
}

export function saveCoupons(coupons: Coupon[]) {
  writeJson(COUPONS_FILE, coupons);
}

export function getRedemptions(): CouponRedemption[] {
  return readJson<CouponRedemption[]>(REDEMPTIONS_FILE, []);
}

export function saveRedemptions(redemptions: CouponRedemption[]) {
  writeJson(REDEMPTIONS_FILE, redemptions);
}

export function createCoupon(data: {
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  expiresAt: string;
}): Coupon {
  const coupons = getCoupons();
  const coupon: Coupon = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    code: data.code.toUpperCase(),
    description: data.description,
    discountPercent: Math.min(Math.max(data.discountPercent, 1), 100),
    maxUses: data.maxUses,
    usedCount: 0,
    expiresAt: data.expiresAt,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  coupons.push(coupon);
  saveCoupons(coupons);
  return coupon;
}

export function updateCoupon(
  id: string,
  data: Partial<Pick<Coupon, "code" | "description" | "discountPercent" | "maxUses" | "expiresAt" | "isActive">>
): Coupon | null {
  const coupons = getCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  if (data.code !== undefined) coupons[idx].code = data.code.toUpperCase();
  if (data.description !== undefined) coupons[idx].description = data.description;
  if (data.discountPercent !== undefined) coupons[idx].discountPercent = Math.min(Math.max(data.discountPercent, 1), 100);
  if (data.maxUses !== undefined) coupons[idx].maxUses = data.maxUses;
  if (data.expiresAt !== undefined) coupons[idx].expiresAt = data.expiresAt;
  if (data.isActive !== undefined) coupons[idx].isActive = data.isActive;
  saveCoupons(coupons);
  return coupons[idx];
}

export function deleteCoupon(id: string): boolean {
  const coupons = getCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  coupons.splice(idx, 1);
  saveCoupons(coupons);
  return true;
}

export function validateCoupon(code: string): { valid: boolean; coupon?: Coupon; error?: string } {
  const coupons = getCoupons();
  const coupon = coupons.find((c) => c.code === code.toUpperCase());
  if (!coupon) return { valid: false, error: "Coupon not found" };
  if (!coupon.isActive) return { valid: false, error: "Coupon is disabled" };
  if (coupon.usedCount >= coupon.maxUses) return { valid: false, error: "Coupon has been fully redeemed" };
  if (new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "Coupon has expired" };
  return { valid: true, coupon };
}

export function redeemCoupon(code: string, account: string): { success: boolean; discount?: number; error?: string } {
  const { valid, coupon, error } = validateCoupon(code);
  if (!valid || !coupon) return { success: false, error };

  const redemptions = getRedemptions();
  const alreadyUsed = redemptions.find(
    (r) => r.couponId === coupon.id && r.account === account
  );
  if (alreadyUsed) return { success: false, error: "You have already used this coupon" };

  coupon.usedCount++;
  saveCoupons(getCoupons().map((c) => (c.id === coupon.id ? coupon : c)));

  redemptions.push({
    couponId: coupon.id,
    couponCode: coupon.code,
    account,
    discountPercent: coupon.discountPercent,
    redeemedAt: new Date().toISOString(),
  });
  saveRedemptions(redemptions);

  return { success: true, discount: coupon.discountPercent };
}

export function getPlayerRedemptions(account: string): CouponRedemption[] {
  return getRedemptions().filter((r) => r.account === account);
}
