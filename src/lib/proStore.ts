import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const STORE_PATH = path.join(process.cwd(), ".data", "pro-store.json");

interface ProStatus {
  isPro: boolean;
  updatedAt: number;
}

interface ProStore {
  [deviceId: string]: ProStatus;
}

// Detect if we're in production serverless mode
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// Lazy-init Redis client (production only)
let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// --- Dev: file-based store ---

function ensureDataDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readStore(): ProStore {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    return {};
  }
  try {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read pro store:", error);
    return {};
  }
}

function writeStore(store: ProStore) {
  ensureDataDir();
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write pro store:", error);
  }
}

// --- Public API ---

// Get Pro status for a device
export async function getProStatus(deviceId: string): Promise<boolean> {
  if (isProduction()) {
    try {
      const val = await getRedis().get(`pro:${deviceId}`);
      return val === "1";
    } catch (error) {
      console.error("Redis getProStatus error:", error);
      return false;
    }
  }

  const store = readStore();
  return store[deviceId]?.isPro || false;
}

// Set Pro status for a device
export async function setProStatus(deviceId: string, isPro: boolean) {
  if (isProduction()) {
    try {
      if (isPro) {
        await getRedis().set(`pro:${deviceId}`, "1");
      } else {
        await getRedis().del(`pro:${deviceId}`);
      }
    } catch (error) {
      console.error("Redis setProStatus error:", error);
    }
    return;
  }

  const store = readStore();
  store[deviceId] = { isPro, updatedAt: Date.now() };
  writeStore(store);
}

// Activate Pro for a device (called after successful payment)
export async function activatePro(deviceId: string) {
  await setProStatus(deviceId, true);
  console.log(`Pro activated for device: ${deviceId}`);
}

// Deactivate Pro for a device (for cancellations)
export async function deactivatePro(deviceId: string) {
  await setProStatus(deviceId, false);
  console.log(`Pro deactivated for device: ${deviceId}`);
}

// Set Stripe customer ID for a device
export async function setCustomerId(deviceId: string, customerId: string) {
  if (isProduction()) {
    try {
      await getRedis().set(`customer:${deviceId}`, customerId);
    } catch (error) {
      console.error("Redis setCustomerId error:", error);
    }
    return;
  }

  // Dev: store in a separate file or extend the existing store
  const filePath = path.join(process.cwd(), ".data", "customer-store.json");
  ensureDataDir();
  let store: Record<string, string> = {};
  try {
    if (fs.existsSync(filePath)) {
      store = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch {}
  store[deviceId] = customerId;
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

// Get Stripe customer ID for a device
export async function getCustomerId(deviceId: string): Promise<string | null> {
  if (isProduction()) {
    try {
      const val = await getRedis().get<string>(`customer:${deviceId}`);
      return val || null;
    } catch (error) {
      console.error("Redis getCustomerId error:", error);
      return null;
    }
  }

  const filePath = path.join(process.cwd(), ".data", "customer-store.json");
  try {
    if (fs.existsSync(filePath)) {
      const store = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return store[deviceId] || null;
    }
  } catch {}
  return null;
}
