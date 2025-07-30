// 文件夹打开工具
export class FolderOpener {
  /**
   * 打开文件夹（仅在Electron环境中有效）
   */
  static async openFolder(folderPath: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electronAPI = (window as any)?.electronAPI;
    if (typeof window !== "undefined" && electronAPI?.openFolder) {
      try {
        // 在Electron环境中，使用electronAPI打开文件夹
        await electronAPI.openFolder(folderPath);
      } catch (error) {
        console.error("Failed to open folder in Electron:", error);
        // 如果Electron API不可用，显示提示信息
        this.showFolderOpenInstructions(folderPath);
      }
    } else {
      // 在Web环境中，显示提示信息
      this.showFolderOpenInstructions(folderPath);
    }
  }

  /**
   * 显示文件夹打开说明
   */
  private static showFolderOpenInstructions(folderPath: string): void {
    const message = `
文件已下载到浏览器默认下载目录。

请手动打开以下文件夹：
${folderPath}

或者：
1. 打开文件管理器
2. 导航到下载文件夹
3. 查找以 "${folderPath}" 命名的文件夹
4. 双击打开该文件夹

注意：在Web环境中，无法自动打开文件夹，请手动操作。
    `;

    alert(message);
  }

  /**
   * 获取下载文件夹路径（仅在Electron环境中有效）
   */
  static async getDownloadPath(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electronAPI = (window as any)?.electronAPI;
    if (typeof window !== "undefined" && electronAPI?.getDownloadPath) {
      try {
        return await electronAPI.getDownloadPath();
      } catch (error) {
        console.error("Failed to get download path:", error);
        return "下载文件夹";
      }
    }
    return "下载文件夹";
  }

  /**
   * 检查是否在Electron环境中
   */
  static isElectron(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof window !== "undefined" && !!(window as any)?.electronAPI;
  }
}
