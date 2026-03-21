const STORAGE_KEY = "stock-yard:recent-symbols";
const MAX_RECENT_SYMBOLS = 6;
const EMPTY_RECENT_SYMBOLS: string[] = [];

const listeners = new Set<() => void>();

let cachedRecentSymbols = EMPTY_RECENT_SYMBOLS;
let isHydratedFromStorage = false;

function normalizeSymbols(value: unknown) {
  if (!Array.isArray(value)) {
    return EMPTY_RECENT_SYMBOLS;
  }

  const uniqueSymbols = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.trim().toUpperCase();

    if (!normalized || uniqueSymbols.has(normalized)) {
      continue;
    }

    uniqueSymbols.add(normalized);

    if (uniqueSymbols.size >= MAX_RECENT_SYMBOLS) {
      break;
    }
  }

  return uniqueSymbols.size ? Array.from(uniqueSymbols) : EMPTY_RECENT_SYMBOLS;
}

function hydrateFromStorage() {
  if (typeof window === "undefined" || isHydratedFromStorage) {
    return;
  }

  isHydratedFromStorage = true;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      cachedRecentSymbols = EMPTY_RECENT_SYMBOLS;
      return;
    }

    cachedRecentSymbols = normalizeSymbols(JSON.parse(rawValue));
  } catch {
    cachedRecentSymbols = EMPTY_RECENT_SYMBOLS;
  }
}

function persistToStorage(symbols: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  const nextSymbols = event.newValue ? normalizeSymbols(JSON.parse(event.newValue)) : EMPTY_RECENT_SYMBOLS;

  if (cachedRecentSymbols === nextSymbols) {
    return;
  }

  cachedRecentSymbols = nextSymbols;
  emitChange();
}

export function readRecentSymbols() {
  hydrateFromStorage();
  return cachedRecentSymbols;
}

export function readRecentSymbolsServerSnapshot() {
  return EMPTY_RECENT_SYMBOLS;
}

export function pushRecentSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();

  if (!normalized || typeof window === "undefined") {
    return;
  }

  const nextSymbols = normalizeSymbols([normalized, ...readRecentSymbols()]);

  if (
    nextSymbols.length === cachedRecentSymbols.length &&
    nextSymbols.every((item, index) => item === cachedRecentSymbols[index])
  ) {
    return;
  }

  cachedRecentSymbols = nextSymbols;
  persistToStorage(nextSymbols);
  emitChange();
}

export function subscribeRecentSymbols(listener: () => void) {
  listeners.add(listener);

  if (typeof window !== "undefined" && listeners.size === 1) {
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    listeners.delete(listener);

    if (typeof window !== "undefined" && listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}
