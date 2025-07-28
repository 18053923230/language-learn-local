# 渐进式迁移步骤指南

## 🎯 迁移策略：在当前项目中添加 Electron 支持

### 优势

- ✅ 保持现有功能不受影响
- ✅ 代码复用率 90%+
- ✅ 渐进式迁移，风险可控
- ✅ 可以同时支持 Web 和桌面版本

## 📋 迁移步骤

### 步骤 1: 安装依赖

```bash
# 安装 Electron 相关依赖
npm install --save-dev electron electron-builder concurrently
npm install --save @ffmpeg-installer/ffmpeg fluent-ffmpeg sqlite3 electron-store
```

### 步骤 2: 创建 Electron 目录结构

```bash
mkdir -p electron/{main,preload,shared}
```

### 步骤 3: 配置构建脚本

修改 `package.json` 中的 scripts：

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:electron": "concurrently \"npm run dev\" \"npm run dev:main\"",
    "dev:main": "tsc -p electron/tsconfig.json && electron .",
    "build": "next build",
    "build:electron": "npm run build && tsc -p electron/tsconfig.json",
    "start": "next start",
    "lint": "next lint",
    "package": "npm run build:electron && electron-builder",
    "package:win": "npm run build:electron && electron-builder --win",
    "package:mac": "npm run build:electron && electron-builder --mac"
  }
}
```

### 步骤 4: 创建 Electron 配置文件

#### 4.1 TypeScript 配置

```json
// electron/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "../dist/electron",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["main/**/*", "preload/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 4.2 打包配置

```json
// electron-builder.json
{
  "appId": "com.yourcompany.language-learn-desktop",
  "productName": "Language Learn Desktop",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/electron/**/*",
    "out/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "node_modules/@ffmpeg-installer/ffmpeg/ffmpeg",
      "to": "ffmpeg"
    }
  ],
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "public/icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "public/icon.png"
  }
}
```

### 步骤 5: 创建核心服务

#### 5.1 FFmpeg 服务

```typescript
// electron/main/ffmpeg-service.ts
import { spawn } from "child_process";
import * as os from "os";
import * as path from "path";

export class FFmpegService {
  private ffmpegPath: string;

  constructor() {
    this.ffmpegPath = this.getFFmpegPath();
  }

  private getFFmpegPath(): string {
    // 优先使用系统安装的 FFmpeg
    const systemFFmpeg = this.findSystemFFmpeg();
    if (systemFFmpeg) return systemFFmpeg;

    // 使用打包的 FFmpeg
    const packagedFFmpeg = this.getPackagedFFmpegPath();
    if (packagedFFmpeg) return packagedFFmpeg;

    throw new Error("FFmpeg not found");
  }

  async detectHardwareAcceleration() {
    const result = await this.exec(["-hide_banner", "-hwaccels"]);
    return this.parseHardwareAcceleration(result);
  }

  async extractVideoSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number
  ) {
    const args = [
      "-i",
      inputPath,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-c:a",
      "aac",
      "-y",
      outputPath,
    ];
    return this.exec(args);
  }

  private async exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.ffmpegPath, args);
      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => (stdout += data.toString()));
      process.stderr?.on("data", (data) => (stderr += data.toString()));

      process.on("close", (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(`FFmpeg failed: ${stderr}`));
      });
    });
  }
}
```

#### 5.2 视频处理器

```typescript
// electron/main/video-processor.ts
import { FFmpegService } from "./ffmpeg-service";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export class VideoProcessor {
  private ffmpegService: FFmpegService;

  constructor(ffmpegService: FFmpegService) {
    this.ffmpegService = ffmpegService;
  }

  async processVideoSegments(segments: any[], options: any) {
    const batchSize = Math.min(os.cpus().length, 4);
    const results = [];

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

  private async processSegment(segment: any, options: any) {
    const outputPath = path.join(os.tmpdir(), `segment_${Date.now()}.mp4`);
    await this.ffmpegService.extractVideoSegment(
      segment.videoFile.path,
      outputPath,
      segment.startTime,
      segment.endTime - segment.startTime
    );
    return outputPath;
  }
}
```

### 步骤 6: 创建主进程入口

```typescript
// electron/main/index.ts
import { app, BrowserWindow } from "electron";
import * as path from "path";
import { setupIpcHandlers } from "./ipc-handlers";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../out/index.html"));
  }

  setupIpcHandlers(mainWindow);
}

app.whenReady().then(createWindow);
```

### 步骤 7: 创建预加载脚本

```typescript
// electron/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  processVideoSegments: (segments: any[], options: any) =>
    ipcRenderer.invoke("video:process-segments", segments, options),

  getHardwareInfo: () => ipcRenderer.invoke("system:get-hardware-info"),

  saveVideo: (videoData: Buffer, filename: string) =>
    ipcRenderer.invoke("file:save-video", videoData, filename),

  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on("progress:update", (event, progress) => callback(progress));
  },
});
```

### 步骤 8: 修改现有组件

#### 8.1 检测运行环境

```typescript
// src/lib/environment.ts
export const isElectron = () => {
  return typeof window !== "undefined" && window.electronAPI;
};

export const getVideoGenerator = () => {
  if (isElectron()) {
    return new ElectronVideoGenerator();
  } else {
    return new WebVideoGenerator();
  }
};
```

#### 8.2 创建 Electron 视频生成器

```typescript
// src/lib/electron-video-generator.ts
export class ElectronVideoGenerator {
  async generateFromMultipleVideos(segments: any[], options: any) {
    if (!window.electronAPI) {
      throw new Error("Electron API not available");
    }

    return await window.electronAPI.processVideoSegments(segments, options);
  }
}
```

### 步骤 9: 测试和调试

```bash
# 开发模式运行
npm run dev:electron

# 构建桌面应用
npm run build:electron

# 打包应用
npm run package:win  # Windows
npm run package:mac  # macOS
```

## 🔄 渐进式迁移策略

### 阶段 1: 基础架构（1-2 天）

- [x] 安装依赖
- [x] 创建目录结构
- [x] 配置构建脚本
- [x] 创建基础服务

### 阶段 2: 核心功能（2-3 天）

- [ ] 实现 FFmpeg 服务
- [ ] 实现视频处理器
- [ ] 设置 IPC 通信
- [ ] 创建预加载脚本

### 阶段 3: 功能迁移（3-4 天）

- [ ] 修改视频生成组件
- [ ] 添加环境检测
- [ ] 实现数据库服务
- [ ] 添加文件管理

### 阶段 4: 优化和测试（2-3 天）

- [ ] 性能优化
- [ ] 错误处理
- [ ] 用户界面适配
- [ ] 测试和调试

### 阶段 5: 打包和发布（1-2 天）

- [ ] 应用打包
- [ ] 自动更新
- [ ] 错误报告
- [ ] 用户文档

## 🎯 预期成果

### 性能提升

- 视频处理速度提升 5-10 倍
- 支持硬件加速
- 更好的内存管理
- 无限制的并发处理

### 功能增强

- 离线工作能力
- 本地文件存储
- 系统集成
- 更好的用户体验

### 开发效率

- 代码复用率 90%+
- 渐进式迁移，风险可控
- 同时支持 Web 和桌面版本
- 易于维护和扩展

## 🚀 开始迁移

1. **备份当前项目**

```bash
cp -r language-learn-local language-learn-local-backup
```

2. **安装依赖**

```bash
npm install --save-dev electron electron-builder concurrently
npm install --save @ffmpeg-installer/ffmpeg fluent-ffmpeg sqlite3 electron-store
```

3. **按照步骤逐步迁移**

4. **测试功能**

```bash
npm run dev:electron
```

这样您就可以在保持现有功能的同时，逐步添加桌面应用的能力！
