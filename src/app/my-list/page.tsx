"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Play,
  Clock,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Target,
  TrendingUp,
  Star,
  Trash2,
  Download,
  Eye,
  Video as VideoIcon,
  Headphones,
  CheckCircle,
  Clock3,
  CalendarDays,
  FileText,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { StorageManager } from "@/lib/storage";
import type { Video } from "@/types/video";
import type { Subtitle } from "@/types/subtitle";
import type { VocabularyItem } from "@/types/vocabulary";
import { toast } from "sonner";

interface LearningProject {
  video: Video;
  subtitles: Subtitle[];
  lastPlayed: Date;
  playCount: number;
  totalDuration: number;
  vocabularyCount: number;
  progress: number; // 0-100
  isFavorite: boolean;
}

export default function MyListPage() {
  const router = useRouter();
  const { setCurrentVideo, setSubtitles } = useAppStore();
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<LearningProject[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "recent" | "favorites" | "in-progress"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<
    "recent" | "name" | "progress" | "duration"
  >("recent");

  // Load user's learning projects
  useEffect(() => {
    loadLearningProjects();
  }, []);

  // Filter and sort projects
  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.video.language
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filter) {
      case "recent":
        filtered = filtered.filter(
          (project) =>
            new Date(project.lastPlayed).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        break;
      case "favorites":
        filtered = filtered.filter((project) => project.isFavorite);
        break;
      case "in-progress":
        filtered = filtered.filter(
          (project) => project.progress > 0 && project.progress < 100
        );
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
        );
        break;
      case "name":
        filtered.sort((a, b) => a.video.name.localeCompare(b.video.name));
        break;
      case "progress":
        filtered.sort((a, b) => b.progress - a.progress);
        break;
      case "duration":
        filtered.sort((a, b) => b.totalDuration - a.totalDuration);
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filter, sortBy]);

  const loadLearningProjects = async () => {
    try {
      setIsLoading(true);

      // Load videos from storage
      const videos = await StorageManager.getAllVideos();
      const projectsData: LearningProject[] = [];

      for (const video of videos) {
        try {
          // Load subtitles for this video
          const subtitles = await StorageManager.getSubtitles(video.id);

          // Load play history
          const playHistory = await StorageManager.getPlayHistory(video.id);

          // Load vocabulary count - simplified for now
          const vocabulary = await StorageManager.getAllVocabulary();
          const videoVocabulary = vocabulary.filter((word) =>
            word.word.toLowerCase().includes(video.name.toLowerCase())
          );

          // Calculate progress based on play history
          const progress = playHistory
            ? Math.min(100, (playHistory.currentTime / video.duration) * 100)
            : 0;

          projectsData.push({
            video,
            subtitles: subtitles || [],
            lastPlayed: playHistory?.lastPlayed || video.uploadedAt,
            playCount: playHistory?.playCount || 0,
            totalDuration: video.duration,
            vocabularyCount: videoVocabulary.length,
            progress,
            isFavorite: false, // TODO: Implement favorites system
          });
        } catch (error) {
          console.error(`Error loading project for video ${video.id}:`, error);
        }
      }

      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading learning projects:", error);
      toast.error("Failed to load learning projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (project: LearningProject) => {
    try {
      // Set current video and subtitles
      setCurrentVideo(project.video);
      setSubtitles(project.subtitles);

      // Navigate to main page
      router.push("/");

      toast.success(`Loaded: ${project.video.name}`);
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
    }
  };

  const handleDeleteProject = async (project: LearningProject) => {
    try {
      // Remove from storage
      await StorageManager.deleteVideo(project.video.id);

      // Update local state
      setProjects(projects.filter((p) => p.video.id !== project.video.id));

      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="education-button-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Video
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  My Learning List
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            My Learning Projects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Continue your language learning journey. Click any project to resume
            where you left off.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <VideoIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.progress > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + p.vocabularyCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Words Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(
                      projects.reduce((sum, p) => sum + p.totalDuration, 0)
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("recent")}
              >
                Recent
              </Button>
              <Button
                variant={filter === "favorites" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("favorites")}
              >
                Favorites
              </Button>
              <Button
                variant={filter === "in-progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("in-progress")}
              >
                In Progress
              </Button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Sort by Recent</option>
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your learning projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filter !== "all"
                  ? "No projects found"
                  : "No learning projects yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Upload your first video to start your language learning journey!"}
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.video.id}
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {project.video.name}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <Languages className="w-4 h-4" />
                        <span className="capitalize">
                          {project.video.language}
                        </span>
                        <span>•</span>
                        <span>{formatDuration(project.totalDuration)}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadProject(project)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(project.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Headphones className="w-4 h-4 text-blue-500" />
                      <span>{project.subtitles.length} subtitles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span>{project.vocabularyCount} words</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Play className="w-4 h-4 text-purple-500" />
                      <span>{project.playCount} plays</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="w-4 h-4 text-orange-500" />
                      <span>{formatDate(project.lastPlayed)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => handleLoadProject(project)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/subtitles?video=${project.video.id}`)
                      }
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
