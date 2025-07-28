"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Monitor,
  Globe,
  Zap,
  Database,
  FileText,
  Video,
  Settings,
} from "lucide-react";
import { isElectron, getPlatformInfo } from "@/lib/environment";

interface MigrationStatus {
  component: string;
  status: "success" | "error" | "warning" | "pending";
  message: string;
  details?: string;
}

export default function MigrationStatusPage() {
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    const info = getPlatformInfo();
    setPlatformInfo(info);

    const status: MigrationStatus[] = [];

    // 检查环境检测
    try {
      const electronDetected = isElectron();
      status.push({
        component: "环境检测",
        status: electronDetected ? "success" : "warning",
        message: electronDetected
          ? "检测到 Electron 环境"
          : "运行在 Web 环境中",
        details: electronDetected
          ? "可以使用桌面版本功能"
          : "使用 Web 版本功能",
      });
    } catch (error) {
      status.push({
        component: "环境检测",
        status: "error",
        message: "环境检测失败",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 检查视频生成器
    try {
      const { getVideoGenerator } = await import("@/lib/environment");
      const videoGenerator = await getVideoGenerator();
      status.push({
        component: "视频生成器",
        status: "success",
        message: "视频生成器加载成功",
        details: `类型: ${videoGenerator.constructor.name}`,
      });
    } catch (error) {
      status.push({
        component: "视频生成器",
        status: "error",
        message: "视频生成器加载失败",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 检查字幕存储
    try {
      const { getSubtitleStorage } = await import("@/lib/environment");
      const subtitleStorage = await getSubtitleStorage();
      status.push({
        component: "字幕存储",
        status: "success",
        message: "字幕存储服务加载成功",
        details: `类型: ${typeof subtitleStorage}`,
      });
    } catch (error) {
      status.push({
        component: "字幕存储",
        status: "error",
        message: "字幕存储服务加载失败",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 检查视频存储
    try {
      const { getVideoStorage } = await import("@/lib/environment");
      const videoStorage = await getVideoStorage();
      status.push({
        component: "视频存储",
        status: "success",
        message: "视频存储服务加载成功",
        details: `类型: ${typeof videoStorage}`,
      });
    } catch (error) {
      status.push({
        component: "视频存储",
        status: "error",
        message: "视频存储服务加载失败",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 检查性能优化器
    try {
      const { getPerformanceOptimizer } = await import("@/lib/environment");
      const performanceOptimizer = await getPerformanceOptimizer();
      status.push({
        component: "性能优化器",
        status: "success",
        message: "性能优化器加载成功",
        details: `类型: ${typeof performanceOptimizer}`,
      });
    } catch (error) {
      status.push({
        component: "性能优化器",
        status: "error",
        message: "性能优化器加载失败",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 检查 Electron API
    if (isElectron()) {
      try {
        const api = (window as any).electronAPI;
        if (api && api.testConnection) {
          const result = api.testConnection();
          status.push({
            component: "Electron API",
            status: "success",
            message: "Electron API 连接成功",
            details: result,
          });
        } else {
          status.push({
            component: "Electron API",
            status: "warning",
            message: "Electron API 部分可用",
            details: "某些功能可能不可用",
          });
        }
      } catch (error) {
        status.push({
          component: "Electron API",
          status: "error",
          message: "Electron API 连接失败",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }

    setMigrationStatus(status);

    // 计算总体进度
    const successCount = status.filter((s) => s.status === "success").length;
    const totalCount = status.length;
    setOverallProgress((successCount / totalCount) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default">成功</Badge>;
      case "error":
        return <Badge variant="destructive">失败</Badge>;
      case "warning":
        return <Badge variant="secondary">警告</Badge>;
      default:
        return <Badge variant="outline">待定</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            渐进式迁移状态
          </h1>
          <p className="text-gray-600 text-lg">
            检查从 Web 版本到桌面版本的迁移进度
          </p>
        </div>

        {/* 总体进度 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              迁移总体进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">完成度</span>
                <span className="text-sm text-gray-600">
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      migrationStatus.filter((s) => s.status === "success")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">成功</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      migrationStatus.filter((s) => s.status === "warning")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">警告</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {migrationStatus.filter((s) => s.status === "error").length}
                  </div>
                  <div className="text-sm text-gray-600">失败</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 平台信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              平台信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">运行环境</p>
                  <div className="flex items-center gap-2 mt-1">
                    {platformInfo.isElectron ? (
                      <>
                        <Monitor className="w-4 h-4 text-blue-500" />
                        <Badge variant="default">Electron</Badge>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-green-500" />
                        <Badge variant="secondary">Web Browser</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">开发模式</p>
                  <div className="flex items-center gap-2 mt-1">
                    {platformInfo.isDevelopment ? (
                      <Badge variant="outline">Development</Badge>
                    ) : (
                      <Badge variant="outline">Production</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">平台</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {platformInfo.platform}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">用户代理</p>
                  <p className="text-sm text-gray-900 mt-1 truncate">
                    {platformInfo.userAgent}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 组件状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              组件状态检查
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {migrationStatus.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.component}
                      </h3>
                      <p className="text-sm text-gray-600">{item.message}</p>
                      {item.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-4">
          <Button onClick={checkMigrationStatus} variant="outline">
            重新检查状态
          </Button>
          <Button onClick={() => window.history.back()} variant="secondary">
            返回
          </Button>
        </div>
      </div>
    </div>
  );
}
