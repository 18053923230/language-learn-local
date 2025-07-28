# 桌面应用架构设计

## 技术栈选择

### 前端框架

- **Electron**: 桌面应用框架
- **React + Next.js**: 复用现有前端代码
- **TypeScript**: 保持类型安全

### 视频处理

- **FFmpeg**: 系统级 FFmpeg，支持硬件加速
- **Node.js**: 后端处理逻辑
- **IPC**: 前后端通信

### 数据存储

- **SQLite**: 本地数据库
- **文件系统**: 视频文件本地存储

## 架构设计

### 1. 主进程 (Main Process)

```
src/main/
├── index.ts              # 主进程入口
├── ffmpeg-service.ts     # FFmpeg 服务
├── video-processor.ts    # 视频处理逻辑
├── database-service.ts   # 数据库服务
├── file-manager.ts       # 文件管理
└── ipc-handlers.ts       # IPC 通信处理
```

### 2. 渲染进程 (Renderer Process)

```
src/renderer/
├── pages/                # 复用现有页面
├── components/           # 复用现有组件
├── lib/                  # 复用现有库
└── preload.ts           # 预加载脚本
```

### 3. 共享类型

```
src/shared/
├── types/               # 共享类型定义
├── constants/           # 常量定义
└── utils/              # 共享工具函数
```

## 核心功能实现

### 1. FFmpeg 服务

```typescript
// src/main/ffmpeg-service.ts
import { spawn } from "child_process";
import { pathToFFmpeg } from "./ffmpeg-config";

export class FFmpegService {
  private ffmpegPath: string;

  constructor() {
    this.ffmpegPath = pathToFFmpeg;
  }

  // 硬件加速检测
  async detectHardwareAcceleration(): Promise<HardwareAccelerationInfo> {
    const result = await this.exec(["-hide_banner", "-hwaccels"]);
    return this.parseHardwareAcceleration(result);
  }

  // 视频片段提取（GPU 加速）
  async extractVideoSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
    options: VideoExtractionOptions
  ): Promise<void> {
    const args = [
      "-i",
      inputPath,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-c:v",
      "h264_nvenc", // NVIDIA GPU 加速
      "-c:a",
      "aac",
      "-y",
      outputPath,
    ];

    return this.exec(args);
  }

  // 视频合并（GPU 加速）
  async combineVideos(
    inputFiles: string[],
    outputPath: string,
    options: VideoCombinationOptions
  ): Promise<void> {
    // 实现视频合并逻辑
  }
}
```

### 2. 视频处理器

```typescript
// src/main/video-processor.ts
export class VideoProcessor {
  private ffmpegService: FFmpegService;
  private hardwareInfo: HardwareAccelerationInfo;

  constructor() {
    this.ffmpegService = new FFmpegService();
  }

  // 批量处理视频片段
  async processVideoSegments(
    segments: VideoSegment[],
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    // 并行处理，充分利用多核 CPU 和 GPU
    const batchSize = this.getOptimalBatchSize();
    const results: ProcessingResult[] = [];

    for (let i = 0; i < segments.length; i += batchSize) {
      const batch = segments.slice(i, i + batchSize);
      const batchPromises = batch.map((segment) =>
        this.processSegment(segment, options)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return this.combineResults(results);
  }

  // 获取最优批处理大小
  private getOptimalBatchSize(): number {
    const cpuCores = os.cpus().length;
    const hasGPU = this.hardwareInfo.hasNVIDIA || this.hardwareInfo.hasAMD;

    if (hasGPU) {
      return Math.min(cpuCores * 2, 8); // GPU 加速可以处理更多并发
    } else {
      return Math.min(cpuCores, 4); // CPU 处理限制并发数
    }
  }
}
```

### 3. IPC 通信

```typescript
// src/main/ipc-handlers.ts
import { ipcMain } from "electron";

export function setupIpcHandlers() {
  // 视频处理请求
  ipcMain.handle("video:process-segments", async (event, segments, options) => {
    const processor = new VideoProcessor();
    return await processor.processVideoSegments(segments, options);
  });

  // 硬件信息获取
  ipcMain.handle("system:get-hardware-info", async () => {
    const ffmpegService = new FFmpegService();
    return await ffmpegService.detectHardwareAcceleration();
  });

  // 文件管理
  ipcMain.handle("file:save-video", async (event, videoData, filename) => {
    const fileManager = new FileManager();
    return await fileManager.saveVideo(videoData, filename);
  });
}
```

### 4. 预加载脚本

```typescript
// src/renderer/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // 视频处理
  processVideoSegments: (
    segments: VideoSegment[],
    options: ProcessingOptions
  ) => ipcRenderer.invoke("video:process-segments", segments, options),

  // 系统信息
  getHardwareInfo: () => ipcRenderer.invoke("system:get-hardware-info"),

  // 文件操作
  saveVideo: (videoData: Buffer, filename: string) =>
    ipcRenderer.invoke("file:save-video", videoData, filename),

  // 进度回调
  onProgress: (callback: (progress: ProcessingProgress) => void) =>
    ipcRenderer.on("processing:progress", callback),
});
```

## 性能优化策略

### 1. 硬件加速

- **NVIDIA GPU**: 使用 `h264_nvenc` 编码器
- **AMD GPU**: 使用 `h264_amf` 编码器
- **Intel GPU**: 使用 `h264_qsv` 编码器
- **多线程**: 充分利用多核 CPU

### 2. 内存管理

- **流式处理**: 避免将整个视频加载到内存
- **临时文件**: 使用系统临时目录
- **垃圾回收**: 及时清理临时文件

### 3. 并发控制

- **动态批大小**: 根据硬件性能调整
- **资源监控**: 监控 CPU 和内存使用
- **队列管理**: 处理大量任务时的队列机制

## 迁移步骤

### 阶段 1: 基础架构

1. 创建 Electron 项目结构
2. 配置 TypeScript 和构建工具
3. 迁移现有 React 组件
4. 设置 IPC 通信

### 阶段 2: 核心功能

1. 实现 FFmpeg 服务
2. 迁移视频处理逻辑
3. 实现文件管理
4. 添加数据库支持

### 阶段 3: 性能优化

1. 实现硬件加速检测
2. 优化并发处理
3. 添加性能监控
4. 用户界面优化

### 阶段 4: 打包发布

1. 配置应用打包
2. 添加自动更新
3. 错误报告系统
4. 用户文档

## 预期性能提升

| 功能         | Web 版本 | 桌面版本 | 提升倍数 |
| ------------ | -------- | -------- | -------- |
| 视频片段提取 | 30 秒    | 3 秒     | 10x      |
| 视频合并     | 60 秒    | 8 秒     | 7.5x     |
| 硬件加速     | 不支持   | 支持     | ∞        |
| 内存使用     | 高       | 低       | 50%      |
| 并发处理     | 受限     | 无限制   | 5x       |

## 技术挑战和解决方案

### 1. FFmpeg 集成

**挑战**: 确保 FFmpeg 在不同平台上的可用性
**解决方案**:

- 使用 `@ffmpeg-installer/ffmpeg` 自动下载
- 提供手动安装选项
- 检测系统已安装的 FFmpeg

### 2. 硬件兼容性

**挑战**: 不同显卡的编码器支持
**解决方案**:

- 自动检测可用编码器
- 提供编码器选择界面
- 降级到 CPU 编码

### 3. 跨平台兼容性

**挑战**: Windows、macOS、Linux 的差异
**解决方案**:

- 使用 Electron 的跨平台 API
- 平台特定的优化
- 统一的用户界面

## 开发工具推荐

### 构建工具

- **Vite**: 快速开发和构建
- **Electron Builder**: 应用打包
- **TypeScript**: 类型安全

### 开发工具

- **Electron DevTools**: 调试工具
- **FFmpeg**: 视频处理
- **SQLite**: 本地数据库

### 测试工具

- **Jest**: 单元测试
- **Spectron**: Electron 测试
- **Playwright**: E2E 测试
