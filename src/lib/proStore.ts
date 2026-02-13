import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), ".data", "pro-store.json");

interface ProStatus {
  isPro: boolean;
  updatedAt: number;
}

interface ProStore {
  [deviceId: string]: ProStatus;
}

// In-memory store for production (serverless)
const memoryStore: ProStore = {};
let hasLoggedWarning = false;

// Detect if we're in production serverless mode
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// Log warning once for in-memory store usage
function logProductionWarning() {
  if (!hasLoggedWarning) {
    console.warn("Using in-memory Pro store (production serverless mode).");
    hasLoggedWarning = true;
  }
}

// Ensure .data directory exists (dev only)
function ensureDataDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read the entire store
function readStore(): ProStore {
  // Production: use in-memory store
  if (isProduction()) {
    logProductionWarning();
    return memoryStore;
  }

  // Development: use file-based store
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

// Write the entire store
function writeStore(store: ProStore) {
  // Production: write to in-memory store
  if (isProduction()) {
    logProductionWarning();
    Object.keys(store).forEach((key) => {
      memoryStore[key] = store[key];
    });
    return;
  }

  // Development: write to file
  ensureDataDir();

  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write pro store:", error);
  }
}

// Get Pro status for a device
export function getProStatus(deviceId: string): boolean {
  const store = readStore();
  return store[deviceId]?.isPro || false;
}

// Set Pro status for a device
export function setProStatus(deviceId: string, isPro: boolean) {
  const store = readStore();
  store[deviceId] = {
    isPro,
    updatedAt: Date.now(),
  };
  writeStore(store);
}

// Activate Pro for a device (called after successful payment)
export function activatePro(deviceId: string) {
  setProStatus(deviceId, true);
  console.log(`Pro activated for device: ${deviceId}`);
}

// Deactivate Pro for a device (optional, for cancellations)
export function deactivatePro(deviceId: string) {
  setProStatus(deviceId, false);
  console.log(`Pro deactivated for device: ${deviceId}`);
}
