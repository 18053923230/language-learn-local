"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Globe, Zap, CheckCircle, XCircle } from "lucide-react";
import { isElectron, getPlatformInfo } from "@/lib/environment";

export default function TestElectronPage() {
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const info = getPlatformInfo();
    setPlatformInfo(info);
    runTests();
  }, []);

  const runTests = async () => {
    const results: any = {};

    // 测试环境检测
    results.environment = {
      isElectron: isElectron(),
      isDevelopment: process.env.NODE_ENV === "development",
    };

    // 测试视频生成器获取
    try {
      const { getVideoGenerator } = await import("@/lib/environment");
      const videoGenerator = await getVideoGenerator();
      results.videoGenerator = {
        success: true,
        type: videoGenerator.constructor.name,
      };
    } catch (error) {
      results.videoGenerator = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // 测试字幕存储获取
    try {
      const { getSubtitleStorage } = await import("@/lib/environment");
      const subtitleStorage = await getSubtitleStorage();
      results.subtitleStorage = {
        success: true,
        type: typeof subtitleStorage,
      };
    } catch (error) {
      results.subtitleStorage = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // 测试视频存储获取
    try {
      const { getVideoStorage } = await import("@/lib/environment");
      const videoStorage = await getVideoStorage();
      results.videoStorage = {
        success: true,
        type: typeof videoStorage,
      };
    } catch (error) {
      results.videoStorage = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // 测试性能优化器获取
    try {
      const { getPerformanceOptimizer } = await import("@/lib/environment");
      const performanceOptimizer = await getPerformanceOptimizer();
      results.performanceOptimizer = {
        success: true,
        type: typeof performanceOptimizer,
      };
    } catch (error) {
      results.performanceOptimizer = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    setTestResults(results);
  };

  const getTestIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Electron 迁移测试
          </h1>
          <p className="text-gray-600">测试渐进式迁移的各个组件是否正常工作</p>
        </div>

        {/* 平台信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
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

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              组件测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(
                ([key, result]: [string, any]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h3>
                      {result.success ? (
                        <p className="text-sm text-gray-600">
                          类型: {result.type}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          错误: {result.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestIcon(result.success)}
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "通过" : "失败"}
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-4">
          <Button onClick={runTests} variant="outline">
            重新运行测试
          </Button>
          <Button onClick={() => window.history.back()} variant="secondary">
            返回
          </Button>
        </div>
      </div>
    </div>
  );
}
