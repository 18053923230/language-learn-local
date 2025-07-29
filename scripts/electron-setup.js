const { download } = require("@electron/get");
const path = require("path");
const fs = require("fs");

async function setupElectron() {
  console.log("开始下载 Electron...");

  try {
    // 下载 Electron
    const electronPath = await download({
      version: "37.2.4",
      platform: process.platform,
      arch: process.arch,
      cache: path.join(__dirname, "../electron-cache"),
    });

    console.log("Electron 下载完成:", electronPath);

    // 创建启动脚本
    const electronScript = `
const { spawn } = require('child_process');
const path = require('path');

const electronPath = '${electronPath.replace(/\\/g, "\\\\")}';
const mainPath = path.join(__dirname, '../dist/electron/main/test-index.js');

console.log('启动 Electron...');
console.log('Electron 路径:', electronPath);
console.log('主进程路径:', mainPath);

const child = spawn(electronPath, [mainPath], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log('Electron 进程退出，代码:', code);
});
`;

    fs.writeFileSync(path.join(__dirname, "start-electron.js"), electronScript);
    console.log("启动脚本已创建: scripts/start-electron.js");
  } catch (error) {
    console.error("下载 Electron 失败:", error);
  }
}

setupElectron();
