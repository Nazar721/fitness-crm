"use client";

import { useEffect } from "react";
import { startBackupScheduler, stopBackupScheduler } from "@/lib/backup";

export function BackupScheduler() {
  useEffect(() => {
    startBackupScheduler();
    return () => stopBackupScheduler();
  }, []);

  return null;
}
