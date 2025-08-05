import { NextRequest, NextResponse } from "next/server";
import { StorageManager } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    // Clear all My Learning Projects
    const projects = await StorageManager.getAllMyLearningProjects();

    for (const project of projects) {
      if (project.videoId) {
        await StorageManager.deleteMyLearningProject(project.videoId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${projects.length} learning projects`,
      clearedCount: projects.length,
    });
  } catch (error) {
    console.error("Error clearing My List data:", error);
    return NextResponse.json(
      { error: "Failed to clear My List data" },
      { status: 500 }
    );
  }
}
