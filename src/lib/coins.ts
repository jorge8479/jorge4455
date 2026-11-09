import { downloadFile, uploadFile } from "./mtasa";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || "";
const PAYPAL_API = process.env.PAYPAL_API === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export interface CoinTransaction {
  id: string;
  type: "purchase" | "grant" | "remove";
  account: string;
  player: string;
  amount: number;
  balanceAfter: number;
  admin?: string;
  reason?: string;
  paymentMethod?: string;
  paymentId?: string;
  timestamp: number;
}

export interface CoinCommand {
  type: "give" | "remove" | "get";
  target: string;
  amount?: number;
  admin?: string;
  reason?: string;
  id: string;
  processed?: boolean;
}

export interface CoinCommandResult {
  id: string;
  success: boolean;
  account?: string;
  player?: string;
  newBalance?: number;
  balance?: number;
  error?: string;
}

export const DEFAULT_COIN_PACKAGES: CoinPackage[] = [
  { id: "coins_100", name: "100 Coins", coins: 100, price: 1.00, currency: "USD" },
  { id: "coins_500", name: "500 Coins", coins: 500, price: 4.00, currency: "USD", popular: true },
  { id: "coins_1000", name: "1,000 Coins", coins: 1000, price: 7.00, currency: "USD" },
  { id: "coins_2500", name: "2,500 Coins", coins: 2500, price: 15.00, currency: "USD" },
  { id: "coins_5000", name: "5,000 Coins", coins: 5000, price: 25.00, currency: "USD" },
  { id: "coins_10000", name: "10,000 Coins", coins: 10000, price: 45.00, currency: "USD" },
];

export async function getCoinPackages(): Promise<CoinPackage[]> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/coin_packages.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.packages && Array.isArray(parsed.packages)) {
        return parsed.packages;
      }
    }
  } catch {}
  return DEFAULT_COIN_PACKAGES;
}

export async function sendCoinCommand(cmd: Omit<CoinCommand, "processed">): Promise<boolean> {
  try {
    const existing = await getCoinCommands();
    existing.push({ ...cmd, processed: false });
    const json = JSON.stringify({ commands: existing });
    const encoder = new TextEncoder();
    await uploadFile("/mods/deathmatch/resources/webadmin/coins_commands.json", encoder.encode(json));
    return true;
  } catch {
    return false;
  }
}

export async function getCoinCommands(): Promise<CoinCommand[]> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/coins_commands.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.commands) {
        return parsed.commands.filter((c: CoinCommand) => !c.processed);
      }
    }
  } catch {}
  return [];
}

export async function getCoinResults(): Promise<CoinCommandResult[]> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/coins_results.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.results) {
        return parsed.results;
      }
    }
  } catch {}
  return [];
}

export async function getCoinTransactions(): Promise<CoinTransaction[]> {
  try {
    const data = await downloadFile("/mods/deathmatch/resources/webadmin/coins_transactions.json");
    if (data) {
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      if (parsed && parsed.transactions) {
        return parsed.transactions;
      }
    }
  } catch {}
  return [];
}

export async function grantCoins(target: string, amount: number, admin: string, reason: string): Promise<CoinCommandResult | null> {
  const id = `grant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const sent = await sendCoinCommand({ type: "give", target, amount, admin, reason, id });
  if (!sent) return null;

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const results = await getCoinResults();
    const found = results.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}

export async function removeCoins(target: string, amount: number, admin: string, reason: string): Promise<CoinCommandResult | null> {
  const id = `remove_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const sent = await sendCoinCommand({ type: "remove", target, amount, admin, reason, id });
  if (!sent) return null;

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const results = await getCoinResults();
    const found = results.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}

export async function getPlayerCoins(target: string): Promise<CoinCommandResult | null> {
  const id = `get_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const sent = await sendCoinCommand({ type: "get", target, id });
  if (!sent) return null;

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const results = await getCoinResults();
    const found = results.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}

export async function addPurchaseTransaction(tx: Omit<CoinTransaction, "id" | "timestamp">): Promise<void> {
  try {
    const transactions = await getCoinTransactions();
    const newTx: CoinTransaction = {
      ...tx,
      id: `purchase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Math.floor(Date.now() / 1000),
    };
    transactions.unshift(newTx);
    if (transactions.length > 1000) transactions.length = 1000;

    const json = JSON.stringify({ transactions, count: transactions.length, timestamp: Math.floor(Date.now() / 1000) });
    const encoder = new TextEncoder();
    await uploadFile("/mods/deathmatch/resources/webadmin/coins_transactions.json", encoder.encode(json));
  } catch {}
}

// PayPal integration
export async function getPayPalAccessToken(): Promise<string | null> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) return null;
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

export async function createPayPalOrder(coins: number, price: number, accountId: string): Promise<{ id: string; approvalUrl: string } | null> {
  const token = await getPayPalAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "USD", value: price.toFixed(2) },
          description: `${coins} Coins - NightSide Roleplay`,
          custom_id: accountId,
        }],
        application_context: {
          brand_name: "NightSide Roleplay",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://nightside-website.vercel.app"}/coins/verify?coins=${coins}&price=${price}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://nightside-website.vercel.app"}/coins`,
        },
      }),
    });
    const data = await res.json();
    if (data.id && data.links) {
      const approveLink = data.links.find((l: any) => l.rel === "approve");
      if (approveLink) {
        return { id: data.id, approvalUrl: approveLink.href };
      }
    }
  } catch {}
  return null;
}

export async function capturePayPalOrder(orderId: string): Promise<{ success: boolean; payerId?: string; amount?: string }> {
  const token = await getPayPalAccessToken();
  if (!token) return { success: false };

  try {
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.status === "COMPLETED") {
      const unit = data.purchase_units?.[0];
      const capture = unit?.payments?.captures?.[0];
      return {
        success: true,
        payerId: data.payer?.payer_id,
        amount: capture?.amount?.value,
      };
    }
  } catch {}
  return { success: false };
}
