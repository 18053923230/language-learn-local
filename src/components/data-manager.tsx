"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataSyncManager, SyncStatus, BackupData } from "@/lib/data-sync";
import {
  Download,
  Upload,
  Cloud,
  CloudOff,
  Trash2,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

export function DataManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    DataSyncManager.getSyncStatus()
  );
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadStorageUsage();
  }, []);

  const loadStorageUsage = async () => {
    try {
      const usage = await DataSyncManager.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error("Failed to load storage usage:", error);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await DataSyncManager.exportBackupToFile();
      setMessage({ type: "success", text: "Backup exported successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to create backup: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await DataSyncManager.importBackupFromFile(file);
      setMessage({ type: "success", text: "Backup restored successfully!" });
      loadStorageUsage(); // 重新加载存储使用情况
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to restore backup: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
      event.target.value = ""; // 清空文件输入
    }
  };

  const handleSyncToCloud = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await DataSyncManager.syncToCloud();
      setSyncStatus(DataSyncManager.getSyncStatus());
      setMessage({
        type: "success",
        text: "Data synced to cloud successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to sync to cloud: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromCloud = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await DataSyncManager.syncFromCloud();
      setSyncStatus(DataSyncManager.getSyncStatus());
      setMessage({
        type: "success",
        text: "Data synced from cloud successfully!",
      });
      loadStorageUsage();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to sync from cloud: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupStorage = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await DataSyncManager.cleanupStorage();
      setMessage({
        type: "success",
        text: `Storage cleaned up! Freed ${(
          result.freedSpace /
          1024 /
          1024
        ).toFixed(2)} MB, deleted ${result.deletedItems} items.`,
      });
      loadStorageUsage();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to cleanup storage: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatPercentage = (used: number, total: number): string => {
    if (total === 0) return "0%";
    return ((used / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Data Management</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={loadStorageUsage}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : message.type === "error" ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Storage Usage */}
      {storageUsage && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <HardDrive className="w-4 h-4 mr-2" />
            Storage Usage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatBytes(storageUsage.usedSpace)}
              </div>
              <div className="text-sm text-gray-600">
                Used of {formatBytes(storageUsage.totalSpace)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPercentage(
                  storageUsage.usedSpace,
                  storageUsage.totalSpace
                )}{" "}
                used
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                {storageUsage.itemCount}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>

          {/* Storage Breakdown */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Storage Breakdown:</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">
                  {storageUsage.breakdown.videos}
                </div>
                <div className="text-gray-500">Videos</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {storageUsage.breakdown.subtitles}
                </div>
                <div className="text-gray-500">Subtitles</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {storageUsage.breakdown.vocabulary}
                </div>
                <div className="text-gray-500">Vocabulary</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {storageUsage.breakdown.playHistory}
                </div>
                <div className="text-gray-500">History</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {storageUsage.breakdown.settings}
                </div>
                <div className="text-gray-500">Settings</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Restore */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Backup & Restore</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Backup
          </Button>

          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              disabled={isLoading}
              className="hidden"
              id="backup-file"
            />
            <label htmlFor="backup-file">
              <Button
                variant="outline"
                disabled={isLoading}
                className="flex items-center cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Backup
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* Cloud Sync */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Cloud className="w-4 h-4 mr-2" />
          Cloud Sync
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Sync:</span>
            <span className="text-sm">
              {syncStatus.lastSync
                ? syncStatus.lastSync.toLocaleString()
                : "Never"}
            </span>
          </div>

          {syncStatus.isSyncing && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                Syncing... {syncStatus.syncedItems}/{syncStatus.totalItems}
              </span>
            </div>
          )}

          {syncStatus.error && (
            <div className="text-sm text-red-600">
              Error: {syncStatus.error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSyncToCloud}
              disabled={isLoading || syncStatus.isSyncing}
              className="flex items-center"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Sync to Cloud
            </Button>

            <Button
              onClick={handleSyncFromCloud}
              disabled={isLoading || syncStatus.isSyncing}
              variant="outline"
              className="flex items-center"
            >
              <CloudOff className="w-4 h-4 mr-2" />
              Sync from Cloud
            </Button>
          </div>
        </div>
      </div>

      {/* Storage Management */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Storage Management</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Clean up old data to free up storage space. This will remove:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Play history older than 30 days</li>
            <li>Video cache older than 30 days</li>
            <li>Unused temporary files</li>
          </ul>

          <Button
            onClick={handleCleanupStorage}
            disabled={isLoading}
            variant="outline"
            className="flex items-center text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cleanup Storage
          </Button>
        </div>
      </div>
    </div>
  );
}
