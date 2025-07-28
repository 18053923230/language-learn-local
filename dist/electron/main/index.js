"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const ipc_handlers_1 = require("./ipc-handlers");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
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
    (0, ipc_handlers_1.setupIpcHandlers)(mainWindow);
}
// 应用准备就绪时创建窗口
electron_1.app.whenReady().then(() => {
    createWindow();
    // macOS 应用激活时重新创建窗口
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// 所有窗口关闭时退出应用
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// 应用退出前清理
electron_1.app.on("before-quit", () => {
    // 清理临时文件等
});
// 处理未捕获的异常
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
