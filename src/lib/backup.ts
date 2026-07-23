import { exportAllData, type ExportData } from "./storage";

const BACKUP_DB_NAME = "fittrack_backup";
const BACKUP_STORE = "handles";
const SETTINGS_KEY = "fittrack_backup_settings";

export interface BackupSettings {
  enabled: boolean;
  backupTime: string; // "HH:mm" format
  maxBackups: number;
  lastBackupTime?: string;
}

export interface BackupFileInfo {
  name: string;
  date: string;
  size: number;
}

const defaultSettings: BackupSettings = {
  enabled: false,
  backupTime: "22:00",
  maxBackups: 30,
};

// ===== IndexedDB helpers for storing directory handle =====

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(BACKUP_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BACKUP_STORE, "readwrite");
    tx.objectStore(BACKUP_STORE).put(handle, "backupDir");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BACKUP_STORE, "readonly");
      const request = tx.objectStore(BACKUP_STORE).get("backupDir");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function removeDirectoryHandle(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BACKUP_STORE, "readwrite");
      tx.objectStore(BACKUP_STORE).delete("backupDir");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

// ===== Settings =====

export function getBackupSettings(): BackupSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveBackupSettings(settings: BackupSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ===== Folder selection =====

export async function selectBackupFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!("showDirectoryPicker" in window)) {
    console.warn("File System Access API not supported");
    return null;
  }
  
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: "readwrite",
      startIn: "documents",
    });
    await storeDirectoryHandle(handle);
    return handle;
  } catch (err) {
    if ((err as Error).name === "AbortError") return null;
    throw err;
  }
}

export async function getBackupFolder(): Promise<FileSystemDirectoryHandle | null> {
  return getDirectoryHandle();
}

export async function clearBackupFolder(): Promise<void> {
  await removeDirectoryHandle();
}

// ===== Backup file naming =====

function formatBackupFileName(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}.json`;
}

// ===== Create backup =====

export async function createBackup(): Promise<{ success: boolean; fileName?: string; error?: string }> {
  const dirHandle = await getDirectoryHandle();
  if (!dirHandle) {
    return { success: false, error: "Папку для резервних копій не обрано" };
  }

  try {
    // Check permission (File System Access API - not in TS types yet)
    const dirAny = dirHandle as any;
    if (dirAny.queryPermission) {
      const permission = await dirAny.queryPermission({ mode: "readwrite" });
      if (permission !== "granted" && dirAny.requestPermission) {
        const requested = await dirAny.requestPermission({ mode: "readwrite" });
        if (requested !== "granted") {
          return { success: false, error: "Немає доступу до папки" };
        }
      }
    }

    // Export data
    const data: ExportData = exportAllData();
    const json = JSON.stringify(data, null, 2);
    const fileName = formatBackupFileName(new Date());

    // Write file
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();

    // Update settings
    const settings = getBackupSettings();
    settings.lastBackupTime = new Date().toISOString();
    saveBackupSettings(settings);

    // Cleanup old backups
    await cleanupOldBackups(dirHandle, settings.maxBackups);

    return { success: true, fileName };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ===== Cleanup old backups =====

async function cleanupOldBackups(dirHandle: FileSystemDirectoryHandle, maxBackups: number): Promise<void> {
  try {
    const files = await listBackupFiles(dirHandle);
    if (files.length <= maxBackups) return;

    // Sort by date, oldest first
    const sorted = files.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const toDelete = sorted.slice(0, files.length - maxBackups);

    for (const file of toDelete) {
      try {
        await dirHandle.removeEntry(file.name);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore cleanup errors
  }
}

// ===== List backup files =====

export async function listBackupFiles(dirHandle?: FileSystemDirectoryHandle): Promise<BackupFileInfo[]> {
  const handle = dirHandle || await getDirectoryHandle();
  if (!handle) return [];

  try {
    const files: BackupFileInfo[] = [];
    const dir = dirHandle as any;
    
    for await (const [name, entry] of dir.entries()) {
      if (entry.kind === "file" && name.startsWith("backup-") && name.endsWith(".json")) {
        const file = await entry.getFile();
        // Extract date from filename: backup-YYYY-MM-DD-HH-mm.json
        const match = name.match(/backup-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.json/);
        const date = match 
          ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00`
          : new Date(file.lastModified).toISOString();
        
        files.push({ name, date, size: file.size });
      }
    }
    
    return files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

// ===== Restore from backup =====

export async function restoreFromFile(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data: ExportData = JSON.parse(text);
    
    // Dynamic import to avoid circular dependency
    const { importAllData } = await import("./storage");
    const result = importAllData(data);
    return result;
  } catch (err) {
    return { success: false, message: "Помилка читання файлу: " + (err as Error).message };
  }
}

// ===== Check if File System Access API is supported =====

export function isFileSystemAccessSupported(): boolean {
  return "showDirectoryPicker" in window;
}
