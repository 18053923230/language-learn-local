import { app, BrowserWindow, ipcMain } from "electron";
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
      webSecurity: true,
    },
    icon: path.join(__dirname, "../../public/icon.png"),
    titleBarStyle: "default",
    show: false, // 先隐藏窗口，等加载完成再显示
  });

  // 设置窗口标题
  mainWindow.setTitle("Language Learn Desktop");

  // 加载应用
  if (process.env.NODE_ENV === "development") {
    // 开发模式：加载 Next.js 开发服务器
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载构建后的文件
    mainWindow.loadFile(path.join(__dirname, "../../out/index.html"));
  }

  // 窗口准备好后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // 窗口关闭事件
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 设置 IPC 处理器
  setupIpcHandlers(mainWindow);
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS 应用激活时重新创建窗口
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 应用退出前清理
app.on("before-quit", () => {
  // 清理临时文件等
});

// 处理未捕获的异常
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
