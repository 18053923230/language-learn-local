# 语言学习项目 - 详细实施计划

## 项目概述

### 项目目标

开发一个基于浏览器的本地语言学习工具，支持视频上传、语音识别、字幕生成、单词学习等功能，完全在本地运行，保护用户隐私。

### 核心功能

1. 视频上传与播放
2. 本地语音识别生成字幕
3. 字幕时间轴同步
4. 单词点击查询释义
5. 生词表管理
6. 句子复读功能

## 技术选型

### 核心技术栈

- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **UI 组件**: Shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **视频播放**: react-player
- **语音识别**: Whisper.cpp WASM
- **音频处理**: ffmpeg.wasm
- **本地存储**: localStorage + Dexie.js (IndexedDB)
- **图标**: @heroicons/react
- **词典 API**: Free Dictionary API

### 技术架构

```
Frontend (Next.js + React)
├── UI Layer (Shadcn/ui + Tailwind)
├── State Management (Zustand)
├── Video Player (react-player)
├── Speech Recognition (Whisper WASM)
├── Audio Processing (ffmpeg.wasm)
└── Local Storage (localStorage + IndexedDB)
```

## 详细实施步骤

### 阶段一：项目初始化与环境搭建 (1-2 天)

#### 1.1 项目创建

```bash
npx create-next-app@latest language-learn --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd language-learn
```

#### 1.2 依赖安装

```bash
# UI组件库
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# 核心功能库
pnpm add react-player zustand @heroicons/react

# 语音识别相关
pnpm add whisper-turbo ffmpeg.wasm

# 本地存储
pnpm add dexie

# 开发依赖
pnpm add -D @types/node @types/react @types/react-dom
```

#### 1.3 项目结构搭建

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── vocabulary/
│   │   └── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── toast.tsx
│   ├── video-player.tsx
│   ├── subtitle-list.tsx
│   ├── learning-panel.tsx
│   ├── vocabulary-manager.tsx
│   └── file-upload.tsx
├── lib/
│   ├── utils.ts
│   ├── store.ts
│   ├── whisper-client.ts
│   ├── audio-processor.ts
│   └── dictionary-api.ts
├── types/
│   ├── video.ts
│   ├── subtitle.ts
│   └── vocabulary.ts
└── hooks/
    ├── use-video-player.ts
    ├── use-speech-recognition.ts
    └── use-vocabulary.ts
```

### 阶段二：基础 UI 框架搭建 (2-3 天)

#### 2.1 主页面布局

- 实现左右分栏布局
- 左侧：视频播放器 + 学习面板
- 右侧：字幕列表
- 响应式设计

#### 2.2 组件开发

- FileUpload 组件：文件选择 + 语言选择
- VideoPlayer 组件：视频播放器封装
- SubtitleList 组件：字幕列表展示
- LearningPanel 组件：学习功能面板

#### 2.3 状态管理设计

```typescript
// store.ts
interface AppState {
  currentVideo: Video | null;
  subtitles: Subtitle[];
  currentSubtitle: Subtitle | null;
  vocabulary: VocabularyItem[];
  isProcessing: boolean;
  language: string;
}
```

### 阶段三：视频播放功能 (1-2 天)

#### 3.1 文件上传

- 支持视频格式验证
- 文件大小限制
- 语言选择下拉框

#### 3.2 视频播放器集成

- react-player 配置
- 播放控制
- 时间轴同步
- 全屏支持

#### 3.3 本地存储集成

- 视频文件缓存
- 播放历史记录

### 阶段四：语音识别核心功能 (3-5 天) ⭐ 重点

#### 4.1 Whisper WASM 集成

- 模型文件下载与配置
- Web Worker 集成
- 错误处理机制

#### 4.2 音频处理

- ffmpeg.wasm 集成
- 视频转音频
- 音频格式优化

#### 4.3 识别流程

```
视频上传 → 音频提取 → Whisper识别 → 字幕生成 → 本地存储
```

#### 4.4 性能优化

- 进度显示
- 后台处理
- 缓存机制

### 阶段五：字幕系统 (2-3 天)

#### 5.1 字幕数据结构

```typescript
interface Subtitle {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
}
```

#### 5.2 字幕展示

- 时间轴显示
- 点击跳转
- 高亮当前播放字幕

#### 5.3 字幕编辑

- 文本修正
- 时间调整
- 导出功能

### 阶段六：学习功能 (3-4 天)

#### 6.1 句子复读

- 时间范围播放
- 循环播放
- 播放速度控制

#### 6.2 单词查询

- 词典 API 集成
- 释义展示
- 发音功能

#### 6.3 生词表

- 添加/删除单词
- 分类管理
- 复习功能

### 阶段七：数据持久化 (1-2 天)

#### 7.1 localStorage 集成

- 生词表存储
- 播放历史
- 用户设置

#### 7.2 IndexedDB 集成 (Dexie.js)

- 字幕数据存储
- 大文件处理
- 数据同步

### 阶段八：优化与完善 (2-3 天)

#### 8.1 性能优化

- 懒加载
- 虚拟滚动
- 内存管理

#### 8.2 用户体验

- 加载状态
- 错误处理
- 快捷键支持

#### 8.3 测试与调试

- 功能测试
- 性能测试
- 兼容性测试

## 时间安排

| 阶段   | 任务        | 预计时间 | 优先级 |
| ------ | ----------- | -------- | ------ |
| 阶段一 | 项目初始化  | 1-2 天   | 高     |
| 阶段二 | UI 框架搭建 | 2-3 天   | 高     |
| 阶段三 | 视频播放    | 1-2 天   | 高     |
| 阶段四 | 语音识别    | 3-5 天   | 最高   |
| 阶段五 | 字幕系统    | 2-3 天   | 高     |
| 阶段六 | 学习功能    | 3-4 天   | 中     |
| 阶段七 | 数据持久化  | 1-2 天   | 中     |
| 阶段八 | 优化完善    | 2-3 天   | 低     |

**总计预计时间：15-24 天**

## 技术难点与解决方案

### 1. 语音识别性能

**难点**: WASM 在浏览器中运行计算密集型任务
**解决方案**:

- 使用 Web Worker 避免阻塞主线程
- 选择合适的模型大小(tiny/base)
- 实现进度显示和取消功能

### 2. 大文件处理

**难点**: 视频文件可能很大，影响处理速度
**解决方案**:

- 分块处理
- 压缩音频
- 本地缓存

### 3. 浏览器兼容性

**难点**: WASM、Web Worker 等新特性兼容性
**解决方案**:

- 功能检测
- 降级方案
- 浏览器版本要求

## 风险评估

### 高风险

1. **语音识别准确率**: 本地模型准确率可能不如云端
2. **性能问题**: 大文件处理可能很慢
3. **浏览器限制**: 某些浏览器可能不支持 WASM

### 中风险

1. **依赖库稳定性**: 第三方库可能更新或停止维护
2. **存储限制**: 本地存储空间有限

### 低风险

1. **UI 兼容性**: 不同屏幕尺寸适配
2. **用户体验**: 学习曲线可能较陡

## 成功标准

### 功能完整性

- [ ] 支持主流视频格式上传
- [ ] 语音识别准确率 > 80%
- [ ] 字幕时间轴同步准确
- [ ] 单词查询功能正常
- [ ] 生词表管理完整

### 性能指标

- [ ] 视频加载时间 < 3 秒
- [ ] 语音识别处理速度 > 1x
- [ ] 内存使用 < 500MB
- [ ] 支持 > 1 小时视频

### 用户体验

- [ ] 界面响应流畅
- [ ] 错误提示清晰
- [ ] 操作流程简单
- [ ] 支持快捷键

## 后续扩展计划

### 短期扩展 (1-2 个月)

- 多语言支持
- 字幕翻译功能
- 学习进度统计
- 导出功能

### 中期扩展 (3-6 个月)

- 云端同步
- 社交功能
- AI 辅助学习
- 移动端适配

### 长期扩展 (6 个月+)

- 在线课程
- 语音合成
- 智能推荐
- 企业版本

## 项目记录

### 更新日志

- **2024-01-XX**: 项目计划创建
- **待更新**: 各阶段完成情况
- **待更新**: 技术难点解决记录
- **待更新**: 性能优化记录

### 技术决策记录

- **待记录**: 技术选型原因
- **待记录**: 架构设计考虑
- **待记录**: 性能优化策略

---

**注意**: 此文档将作为项目开发的主要参考，所有重要决策和进度更新都将在此记录。
