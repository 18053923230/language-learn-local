import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Smartphone, Download, Settings, Play } from "lucide-react";
import {
  verticalVideoGenerator,
  VerticalVideoOptions,
  VerticalVideoProgress,
} from "@/lib/vertical-video-generator";
import { VerticalVideoCache } from "@/lib/vertical-video-cache";
import { RawTranscriptionData } from "@/types/raw-transcription";
import { Subtitle } from "@/types/subtitle";
import { useAppStore } from "@/lib/store";

interface VerticalVideoGeneratorButtonProps {
  audioFile?: File;
  rawTranscriptionData?: RawTranscriptionData;
  subtitles?: Subtitle[];
  onVideoGenerated?: (videoBlob: Blob) => void;
}

export function VerticalVideoGeneratorButton({
  audioFile,
  rawTranscriptionData,
  subtitles,
  onVideoGenerated,
}: VerticalVideoGeneratorButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<VerticalVideoProgress | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hasCache, setHasCache] = useState(false);
  const [options, setOptions] = useState<VerticalVideoOptions>({
    outputFormat: "mp4",
    quality: "low", // 默认使用低质量，提高速度
    backgroundColor: "#000000",
    subtitleColor: "#FFFFFF",
    highlightColor: "#FFFF00",
    fontSize: 24,
    scrollSpeed: 30,
    videoWidth: 1080,
    videoHeight: 1920,
    audioVolume: 1.0,
    subtitlePosition: "center",
    showWordTiming: true,
  });

  const currentVideo = useAppStore((state) => state.currentVideo);
  const currentSubtitles = useAppStore((state) => state.subtitles);

  // 使用传入的数据或从store获取
  const finalAudioFile = audioFile || (currentVideo?.file as File);
  const finalRawData = rawTranscriptionData;
  const finalSubtitles = subtitles || currentSubtitles;

  // 检查缓存状态
  React.useEffect(() => {
    if (finalAudioFile) {
      const videoId = VerticalVideoCache.generateVideoId(finalAudioFile);
      const cached = VerticalVideoCache.hasCache(videoId);
      setHasCache(cached);
    }
  }, [finalAudioFile]);

  const handleGenerate = async () => {
    if (
      !finalAudioFile ||
      !finalRawData ||
      !finalSubtitles ||
      finalSubtitles.length === 0
    ) {
      toast.error("缺少必要的音频文件、原始数据或字幕数据");
      return;
    }

    setIsGenerating(true);
    setProgress(null);

    try {
      const videoBlob = await verticalVideoGenerator.generateVerticalVideo(
        finalAudioFile,
        finalRawData,
        finalSubtitles,
        options,
        (progress) => {
          setProgress(progress);
          console.log("Vertical video generation progress:", progress);
        }
      );

      toast.success("竖屏视频生成成功！");

      // 创建下载链接
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vertical_video_${Date.now()}.${options.outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 回调函数
      onVideoGenerated?.(videoBlob);
    } catch (error) {
      console.error("Error generating vertical video:", error);
      toast.error("竖屏视频生成失败");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const canGenerate =
    finalAudioFile &&
    finalRawData &&
    finalSubtitles &&
    finalSubtitles.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          竖屏学习视频生成器
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 状态信息 */}
        <div className="text-sm text-muted-foreground">
          {canGenerate ? (
            <div className="space-y-1">
              <p>✓ 音频文件: {finalAudioFile?.name}</p>
              <p>✓ 原始数据: 可用</p>
              <p>✓ 字幕数据: {finalSubtitles?.length || 0} 条</p>
              <p>📝 将显示第1条字幕（极简版本，确保稳定性）</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p>❌ 缺少必要的音频文件、原始数据或字幕数据</p>
              <p>请先上传视频并生成字幕</p>
            </div>
          )}
        </div>

        {/* 设置面板 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              视频设置
            </Label>
            <Switch checked={showSettings} onCheckedChange={setShowSettings} />
          </div>

          {showSettings && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              {/* 输出格式 */}
              <div className="space-y-2">
                <Label>输出格式</Label>
                <Select
                  value={options.outputFormat}
                  onValueChange={(value: "mp4" | "webm") =>
                    setOptions({ ...options, outputFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 质量 */}
              <div className="space-y-2">
                <Label>质量</Label>
                <Select
                  value={options.quality}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setOptions({ ...options, quality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低质量</SelectItem>
                    <SelectItem value="medium">中等质量</SelectItem>
                    <SelectItem value="high">高质量</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 字体大小 */}
              <div className="space-y-2">
                <Label>字体大小</Label>
                <Input
                  type="number"
                  value={options.fontSize}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      fontSize: parseInt(e.target.value),
                    })
                  }
                  min="12"
                  max="48"
                />
              </div>

              {/* 滚动速度 */}
              <div className="space-y-2">
                <Label>滚动速度 (像素/秒)</Label>
                <Input
                  type="number"
                  value={options.scrollSpeed}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      scrollSpeed: parseInt(e.target.value),
                    })
                  }
                  min="10"
                  max="100"
                />
              </div>

              {/* 字幕位置 */}
              <div className="space-y-2">
                <Label>字幕位置</Label>
                <Select
                  value={options.subtitlePosition}
                  onValueChange={(value: "center" | "bottom") =>
                    setOptions({ ...options, subtitlePosition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">居中</SelectItem>
                    <SelectItem value="bottom">底部</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 显示单词时间轴 */}
              <div className="space-y-2">
                <Label>显示单词时间轴</Label>
                <Switch
                  checked={options.showWordTiming}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, showWordTiming: checked })
                  }
                />
              </div>

              {/* 颜色设置 */}
              <div className="space-y-2">
                <Label>背景颜色</Label>
                <Input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) =>
                    setOptions({ ...options, backgroundColor: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>字幕颜色</Label>
                <Input
                  type="color"
                  value={options.subtitleColor}
                  onChange={(e) =>
                    setOptions({ ...options, subtitleColor: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>高亮颜色</Label>
                <Input
                  type="color"
                  value={options.highlightColor}
                  onChange={(e) =>
                    setOptions({ ...options, highlightColor: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* 进度显示 */}
        {isGenerating && progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} />
            {progress.currentStep && progress.totalSteps && (
              <div className="text-xs text-muted-foreground">
                步骤 {progress.currentStep} / {progress.totalSteps}
              </div>
            )}
          </div>
        )}

        {/* 生成按钮 */}
        <div className="space-y-2">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Play className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {hasCache ? "生成竖屏视频 (缓存)" : "生成竖屏视频"}
              </>
            )}
          </Button>

          {/* 测试按钮 */}
          <Button
            onClick={async () => {
              if (!finalAudioFile) {
                toast.error("缺少音频文件");
                return;
              }

              setIsGenerating(true);
              try {
                const videoBlob =
                  await verticalVideoGenerator.generateTestVideo(
                    finalAudioFile,
                    options
                  );

                toast.success("测试视频生成成功！");

                // 创建下载链接
                const url = URL.createObjectURL(videoBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `test_vertical_video_${Date.now()}.${
                  options.outputFormat
                }`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Error generating test video:", error);
                toast.error("测试视频生成失败");
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={!finalAudioFile || isGenerating}
            variant="outline"
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            生成测试视频
          </Button>

          {/* 简单测试按钮 */}
          <Button
            onClick={async () => {
              setIsGenerating(true);
              try {
                const videoBlob =
                  await verticalVideoGenerator.generateSimpleTestVideo();

                toast.success("简单测试视频生成成功！");

                // 创建下载链接
                const url = URL.createObjectURL(videoBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `simple_test_video_${Date.now()}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Error generating simple test video:", error);
                toast.error("简单测试视频生成失败");
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            简单测试（仅文字）
          </Button>

          {/* Canvas视频生成按钮 */}
          <Button
            onClick={async () => {
              if (
                !finalAudioFile ||
                !finalSubtitles ||
                finalSubtitles.length === 0
              ) {
                toast.error("缺少音频文件或字幕数据");
                return;
              }

              setIsGenerating(true);
              try {
                const videoBlob =
                  await verticalVideoGenerator.generateCanvasVideo(
                    finalAudioFile,
                    finalSubtitles,
                    options
                  );

                toast.success("Canvas视频生成成功！");

                // 创建下载链接
                const url = URL.createObjectURL(videoBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `canvas_video_${Date.now()}.${
                  options.outputFormat
                }`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Error generating canvas video:", error);
                toast.error("Canvas视频生成失败");
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={
              !finalAudioFile ||
              !finalSubtitles ||
              finalSubtitles.length === 0 ||
              isGenerating
            }
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Canvas视频（推荐）
          </Button>

          {/* 清理缓存按钮 */}
          <Button
            onClick={() => {
              VerticalVideoCache.clearAllCache();
              setHasCache(false);
              toast.success("缓存已清理");
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            清理缓存
          </Button>
        </div>

        {/* 缓存状态 */}
        {hasCache && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            <p>✓ 检测到缓存数据，将跳过音频处理步骤</p>
            <p>
              缓存统计：{VerticalVideoCache.getCacheStats().count} 个文件，
              {(
                VerticalVideoCache.getCacheStats().totalSize /
                1024 /
                1024
              ).toFixed(1)}
              MB
            </p>
          </div>
        )}

        {/* 功能说明 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 生成竖屏格式的学习视频 (1080x1920)</p>
          <p>• 字幕向上滚动显示，智能分段避免重叠</p>
          <p>• 播放到对应单词时自动高亮显示</p>
          <p>• 支持自定义颜色、字体大小、滚动速度</p>
          <p>• 自动下载生成的视频文件</p>
          <p>• 测试视频：生成简单的10秒测试视频（带字幕）</p>
          <p>• 简单测试：生成5秒纯文字测试视频（Hello World）</p>
          <p>• Canvas视频：使用Canvas API生成带字幕的视频（推荐）</p>
          <p>• 显示前3条字幕（白色文字，确保可见性）</p>
          <p>• 智能缓存：自动缓存音频和字幕数据，避免重复处理</p>
        </div>
      </CardContent>
    </Card>
  );
}
