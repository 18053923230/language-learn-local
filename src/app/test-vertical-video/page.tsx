"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileAudio, FileVideo, Smartphone } from "lucide-react";
import { VerticalVideoGeneratorButton } from "@/components/vertical-video-generator-button";
import { useAppStore } from "@/lib/store";
import { RawTranscriptionData } from "@/types/raw-transcription";
import { Subtitle } from "@/types/subtitle";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { subtitleVersionStorage } from "@/lib/subtitle-version-storage";
import { assemblyAIService } from "@/lib/assemblyai-service";

export default function TestVerticalVideoPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [rawTranscriptionData, setRawTranscriptionData] =
    useState<RawTranscriptionData | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("en");

  const currentVideo = useAppStore((state) => state.currentVideo);
  const currentSubtitles = useAppStore((state) => state.subtitles);

  // 检查是否有现有的数据
  useEffect(() => {
    const checkExistingData = async () => {
      if (currentVideo) {
        try {
          // 检查是否有原始数据
          const rawData = await rawTranscriptionStorage.getRawData(
            currentVideo.id
          );
          if (rawData) {
            setRawTranscriptionData(rawData);
            console.log("Found existing raw transcription data");
          }

          // 检查是否有字幕版本
          const versions = await subtitleVersionStorage.getVersions(
            currentVideo.id
          );
          if (versions.length > 0) {
            const defaultVersion =
              versions.find((v) => v.isDefault) || versions[0];
            setSubtitles(defaultVersion.subtitles);
            console.log("Found existing subtitle version");
          } else if (currentSubtitles.length > 0) {
            setSubtitles(currentSubtitles);
            console.log("Using current subtitles from store");
          }
        } catch (error) {
          console.error("Error checking existing data:", error);
        }
      }
    };

    checkExistingData();
  }, [currentVideo, currentSubtitles]);

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);
    setIsProcessing(true);

    try {
      // 转录音频
      const videoId = `vertical-test-${Date.now()}`;
      const result = await assemblyAIService.transcribeAudio(
        file,
        videoId,
        language
      );

      if (result.rawData) {
        setRawTranscriptionData(result.rawData);

        // 保存原始数据
        await rawTranscriptionStorage.saveRawData(result.rawData);
        toast.success("原始数据保存成功");

        // 生成智能分段字幕
        const { defaultSubtitleGenerator } = await import(
          "@/lib/subtitle-generator"
        );
        const generatedSubtitles = defaultSubtitleGenerator.generateFromRawData(
          result.rawData
        );
        setSubtitles(generatedSubtitles);

        // 创建字幕版本
        const smartVersion =
          await subtitleVersionStorage.createSmartVersionFromRawData(
            result.rawData.videoId,
            result.rawData
          );

        toast.success(`字幕生成成功！共 ${generatedSubtitles.length} 条`);
        console.log("Generated subtitles:", generatedSubtitles);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("音频处理失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoGenerated = (videoBlob: Blob) => {
    console.log("Vertical video generated:", videoBlob);
    toast.success("竖屏视频已生成并下载");
  };

  const canGenerate = audioFile && rawTranscriptionData && subtitles.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">竖屏学习视频生成器</h1>
        <p className="text-muted-foreground">
          生成带有滚动字幕和单词高亮的竖屏学习视频
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：音频上传和处理 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                音频文件处理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 语言选择 */}
              <div className="space-y-2">
                <Label>语言</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 文件上传 */}
              <div className="space-y-2">
                <Label>上传音频文件</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(file);
                      }
                    }}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      点击上传音频或视频文件
                    </span>
                  </label>
                </div>
              </div>

              {/* 状态信息 */}
              <div className="space-y-2">
                <Label>处理状态</Label>
                <div className="text-sm space-y-1">
                  {audioFile && (
                    <p className="text-green-600">
                      ✓ 音频文件: {audioFile.name}
                    </p>
                  )}
                  {rawTranscriptionData && (
                    <p className="text-green-600">
                      ✓ 原始数据:{" "}
                      {rawTranscriptionData.assemblyData.words?.length || 0}{" "}
                      个单词
                    </p>
                  )}
                  {subtitles.length > 0 && (
                    <p className="text-green-600">
                      ✓ 字幕数据: {subtitles.length} 条
                    </p>
                  )}
                  {isProcessing && (
                    <p className="text-blue-600">🔄 正在处理音频...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 字幕预览 */}
          {subtitles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>字幕预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {subtitles.slice(0, 10).map((subtitle, index) => (
                    <div
                      key={subtitle.id}
                      className="p-2 border rounded text-sm"
                    >
                      <div className="text-xs text-muted-foreground">
                        {subtitle.start.toFixed(1)}s - {subtitle.end.toFixed(1)}
                        s
                      </div>
                      <div>{subtitle.text}</div>
                    </div>
                  ))}
                  {subtitles.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      还有 {subtitles.length - 10} 条字幕...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：视频生成器 */}
        <div className="space-y-6">
          <VerticalVideoGeneratorButton
            audioFile={audioFile || undefined}
            rawTranscriptionData={rawTranscriptionData || undefined}
            subtitles={subtitles}
            onVideoGenerated={handleVideoGenerated}
          />

          {/* 功能说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                功能特点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>竖屏格式</strong>
                    <p className="text-muted-foreground">
                      1080x1920 分辨率，适合手机观看
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>滚动字幕</strong>
                    <p className="text-muted-foreground">
                      字幕向上滚动，动态显示
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>单词高亮</strong>
                    <p className="text-muted-foreground">
                      播放到对应单词时自动高亮显示
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>原声音频</strong>
                    <p className="text-muted-foreground">
                      保持原始音频质量，支持音量调节
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>自定义设置</strong>
                    <p className="text-muted-foreground">
                      支持颜色、字体、位置等自定义
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部说明 */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>这个功能将音频和字幕结合，生成适合语言学习的竖屏视频。</p>
            <p>
              视频包含原声音频、滚动字幕和单词高亮效果，帮助学习者更好地理解发音和文本的对应关系。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
