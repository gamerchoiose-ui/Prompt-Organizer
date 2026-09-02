import { openDB } from 'idb';

const DB_NAME = 'promptcraft_db';
const STORE_NAME = 'storage_store';
const DB_VERSION = 1;

export async function getDB() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return null;
  }
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  } catch (e) {
    console.warn('IndexedDB initialization failed, falling back to localStorage:', e);
    return null;
  }
}

export async function getIDBItem<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    if (!db) {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    }
    const val = await db.get(STORE_NAME, key);
    if (val !== undefined && val !== null) {
      return val as T;
    }
    // Fallback to localStorage if not found in IDB
    const localVal = localStorage.getItem(key);
    return localVal ? JSON.parse(localVal) : null;
  } catch (e) {
    console.warn(`IndexedDB read error for ${key}, falling back to localStorage:`, e);
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }
}

export async function setIDBItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    if (!db) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    await db.put(STORE_NAME, value, key);
    // Attempt mirror backup to localStorage (non-blocking if quota exceeded)
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // localStorage quota exceeded ignored since IndexedDB has high capacity
    }
  } catch (e) {
    console.warn(`IndexedDB write error for ${key}, falling back to localStorage:`, e);
    localStorage.setItem(key, JSON.stringify(value));
  }
}
