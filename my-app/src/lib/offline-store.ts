const STORAGE_PREFIX = 'quick-transfer:';
const OFFLINE_EVENT = 'quick-transfer:offline';

export interface OfflineEventDetail {
  active: boolean;
  message: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function readCollection<T>(key: string, seed: readonly T[]): T[] {
  if (!canUseStorage()) return clone([...seed]);
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    const initial = clone([...seed]);
    window.localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : clone([...seed]);
  } catch {
    window.localStorage.removeItem(storageKey);
    return clone([...seed]);
  }
}

export function writeCollection<T>(key: string, data: readonly T[]): T[] {
  const next = clone([...data]);
  if (canUseStorage()) {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(next));
  }
  return next;
}

export function createLocalId(prefix: string) {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

export function notifyOfflineFallback(message = 'API offline. Dados salvos localmente.') {
  if (typeof window === 'undefined') return;
  const detail: OfflineEventDetail = { active: true, message };
  window.sessionStorage.setItem(OFFLINE_EVENT, JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent(OFFLINE_EVENT, { detail }));
}

export function notifyApiOnline() {
  if (typeof window === 'undefined') return;
  const detail: OfflineEventDetail = { active: false, message: 'API online.' };
  window.sessionStorage.removeItem(OFFLINE_EVENT);
  window.dispatchEvent(new CustomEvent(OFFLINE_EVENT, { detail }));
}

export function subscribeToOfflineStatus(listener: (detail: OfflineEventDetail) => void) {
  if (typeof window === 'undefined') return () => undefined;
  const saved = window.sessionStorage.getItem(OFFLINE_EVENT);
  if (saved) {
    try { listener(JSON.parse(saved) as OfflineEventDetail); } catch { window.sessionStorage.removeItem(OFFLINE_EVENT); }
  }
  const handler = (event: Event) => {
    listener((event as CustomEvent<OfflineEventDetail>).detail);
  };
  window.addEventListener(OFFLINE_EVENT, handler);
  return () => window.removeEventListener(OFFLINE_EVENT, handler);
}

export interface ApiFirstOptions {
  neverFallbackStatuses?: number[];
}

function isMockSession() {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('mock-session-not-valid-for-backend');
}

export async function apiFirst<T>(
  remote: () => Promise<T>,
  local: () => T | Promise<T>,
  _options?: ApiFirstOptions
) {
  void _options;
  if (isMockSession()) {
    notifyOfflineFallback('Sessão de demonstração: dados salvos somente neste navegador.');
    return local();
  }
  try {
    const result = await remote();
    notifyApiOnline();
    return result;
  } catch (error) {
    // Real authenticated sessions must never turn authorization, validation,
    // not-found, or server failures into apparently successful local writes.
    // Local data is reserved exclusively for the explicit mock session above.
    throw error;
  }
}
