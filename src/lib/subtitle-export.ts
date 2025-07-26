import { Subtitle } from "@/types/subtitle";

export interface ExportOptions {
  format: "srt" | "vtt" | "txt" | "json";
  includeTimestamps?: boolean;
  includeConfidence?: boolean;
  language?: string;
}

export class SubtitleExporter {
  static exportSubtitles(
    subtitles: Subtitle[],
    options: ExportOptions
  ): string {
    switch (options.format) {
      case "srt":
        return this.exportToSRT(subtitles);
      case "vtt":
        return this.exportToVTT(subtitles);
      case "txt":
        return this.exportToTXT(subtitles, options);
      case "json":
        return this.exportToJSON(subtitles);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private static exportToSRT(subtitles: Subtitle[]): string {
    return subtitles
      .map((subtitle, index) => {
        const startTime = this.formatTimeSRT(subtitle.start);
        const endTime = this.formatTimeSRT(subtitle.end);
        return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
      })
      .join("\n");
  }

  private static exportToVTT(subtitles: Subtitle[]): string {
    const header = "WEBVTT\n\n";
    const body = subtitles
      .map((subtitle, index) => {
        const startTime = this.formatTimeVTT(subtitle.start);
        const endTime = this.formatTimeVTT(subtitle.end);
        return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
      })
      .join("\n");
    return header + body;
  }

  private static exportToTXT(
    subtitles: Subtitle[],
    options: ExportOptions
  ): string {
    return subtitles
      .map((subtitle) => {
        let line = subtitle.text;

        if (options.includeTimestamps) {
          const startTime = this.formatTimeSRT(subtitle.start);
          const endTime = this.formatTimeSRT(subtitle.end);
          line = `[${startTime} --> ${endTime}] ${line}`;
        }

        if (options.includeConfidence) {
          line += ` (${Math.round(subtitle.confidence * 100)}%)`;
        }

        return line;
      })
      .join("\n");
  }

  private static exportToJSON(subtitles: Subtitle[]): string {
    return JSON.stringify(subtitles, null, 2);
  }

  private static formatTimeSRT(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`;
  }

  private static formatTimeVTT(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  }

  static downloadSubtitles(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static getFilename(videoName: string, format: string): string {
    const baseName = videoName.replace(/\.[^/.]+$/, ""); // Remove extension
    const extensions = {
      srt: ".srt",
      vtt: ".vtt",
      txt: ".txt",
      json: ".json",
    };
    return `${baseName}_subtitles${
      extensions[format as keyof typeof extensions]
    }`;
  }
}
