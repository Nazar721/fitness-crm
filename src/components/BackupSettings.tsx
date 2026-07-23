"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Clock,
  Database,
  Trash2,
  Check,
  AlertTriangle,
  Download,
  RefreshCw,
  Snowflake,
  HardDrive,
  Info,
} from "lucide-react";
import {
  getBackupSettings,
  saveBackupSettings,
  selectBackupFolder,
  getBackupFolder,
  clearBackupFolder,
  createBackup,
  listBackupFiles,
  startBackupScheduler,
  isFileSystemAccessSupported,
  type BackupSettings as BackupSettingsType,
  type BackupFileInfo,
} from "@/lib/backup";

export function BackupSettings() {
  const [settings, setSettings] = useState<BackupSettingsType>({
    enabled: false,
    backupTime: "22:00",
    maxBackups: 30,
  });
  const [folderName, setFolderName] = useState<string | null>(null);
  const [folderSet, setFolderSet] = useState(false);
  const [backups, setBackups] = useState<BackupFileInfo[]>([]);
  const [creating, setCreating] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [apiSupported, setApiSupported] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getBackupSettings();
    setSettings(s);
    setApiSupported(isFileSystemAccessSupported());
    
    getBackupFolder().then(handle => {
      if (handle) {
        setFolderSet(true);
        setFolderName(handle.name);
        listBackupFiles(handle).then(setBackups);
      }
      setLoading(false);
    });

    if (s.enabled) {
      startBackupScheduler();
    }
  }, []);

  const handleSelectFolder = async () => {
    const handle = await selectBackupFolder();
    if (handle) {
      setFolderSet(true);
      setFolderName(handle.name);
      const files = await listBackupFiles(handle);
      setBackups(files);
    }
  };

  const handleClearFolder = async () => {
    await clearBackupFolder();
    setFolderSet(false);
    setFolderName(null);
    setBackups([]);
  };

  const handleToggle = (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveBackupSettings(newSettings);
    if (enabled) {
      startBackupScheduler();
    }
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, backupTime: time };
    setSettings(newSettings);
    saveBackupSettings(newSettings);
  };

  const handleMaxBackupsChange = (max: number) => {
    const clamped = Math.max(1, Math.min(100, max));
    const newSettings = { ...settings, maxBackups: clamped };
    setSettings(newSettings);
    saveBackupSettings(newSettings);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setLastResult(null);
    const result = await createBackup();
    setLastResult({
      success: result.success,
      message: result.success ? `Створено: ${result.fileName}` : result.error || "Помилка",
    });
    setCreating(false);
    
    // Refresh file list
    const handle = await getBackupFolder();
    if (handle) {
      const files = await listBackupFiles(handle);
      setBackups(files);
    }

    setTimeout(() => setLastResult(null), 4000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  if (loading) return null;

  return (
    <Card>
      <h3 className="font-medium text-white mb-4 flex items-center gap-2">
        <div className="p-2 rounded-xl bg-blue-400/10">
          <HardDrive className="w-4 h-4 text-blue-400" />
        </div>
        Автоматичне резервне копіювання
      </h3>

      {!apiSupported ? (
        <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-300">Браузер не підтримується</p>
              <p className="text-xs text-gray-400 mt-1">
                Автоматичне резервне копіювання потребує File System Access API. Використовуйте Chrome, Edge або Opera.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Folder Selection */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <FolderOpen className={`w-4 h-4 ${folderSet ? 'text-lime' : 'text-gray-500'}`} />
                <div>
                  <p className="text-sm text-white font-medium">
                    {folderSet ? folderName : "Папку не обрано"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {folderSet ? "Папка для зберігання копій" : "Оберіть папку для резервних копій"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectFolder}
                  className="px-3 py-1.5 rounded-lg bg-lime/10 text-lime text-xs font-medium hover:bg-lime/20 transition-colors"
                >
                  {folderSet ? "Змінити" : "Обрати"}
                </button>
                {folderSet && (
                  <button
                    onClick={handleClearFolder}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Auto Backup Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] mb-3">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-4 h-4 ${settings.enabled ? 'text-lime' : 'text-gray-500'}`} />
              <div>
                <p className="text-sm text-white font-medium">Щоденне резервне копіювання</p>
                <p className="text-[10px] text-gray-500">Створювати копію автоматично</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(!settings.enabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.enabled ? 'bg-lime' : 'bg-white/10'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                settings.enabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Time & Max Backups */}
          {settings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 mb-4"
            >
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-electric" />
                  <span className="text-sm text-gray-300">Час резервного копіювання</span>
                </div>
                <input
                  type="time"
                  value={settings.backupTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-lime [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Макс. кількість копій</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMaxBackupsChange(settings.maxBackups - 5)}
                    className="w-7 h-7 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">{settings.maxBackups}</span>
                  <button
                    onClick={() => handleMaxBackupsChange(settings.maxBackups + 5)}
                    className="w-7 h-7 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-electric/5">
                <Info className="w-3.5 h-3.5 text-electric flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400">
                  Автоматичне копіювання працює поки відкрита сторінка. При перевищенні ліміту найстаріші копії видаляються автоматично.
                </p>
              </div>
            </motion.div>
          )}

          {/* Manual Backup Button */}
          <button
            onClick={handleCreateBackup}
            disabled={!folderSet || creating}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              folderSet && !creating
                ? "bg-lime/10 text-lime hover:bg-lime/20"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            {creating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Створення...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Створити резервну копію зараз
              </>
            )}
          </button>

          {/* Last result */}
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 p-3 rounded-xl text-sm ${
                lastResult.success 
                  ? "bg-lime/10 text-lime border border-lime/20" 
                  : "bg-red-400/10 text-red-400 border border-red-400/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {lastResult.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {lastResult.message}
              </div>
            </motion.div>
          )}

          {/* Backup Files List */}
          {backups.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium">Останні копії ({backups.length})</p>
                {settings.lastBackupTime && (
                  <p className="text-[10px] text-gray-500">
                    Останнє: {new Date(settings.lastBackupTime).toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {backups.slice(0, 10).map((backup) => (
                  <div
                    key={backup.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-gray-300">{backup.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{formatFileSize(backup.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
