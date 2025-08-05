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
import { StorageManager, MyLearningProject } from "@/lib/storage";
import type { Video } from "@/types/video";
import type { Subtitle } from "@/types/subtitle";
import type { VocabularyItem } from "@/types/vocabulary";
import { toast } from "sonner";
import { Navigation } from "@/components/navigation";
import { BookOpen } from "lucide-react";

export default function MyListPage() {
  const router = useRouter();
  const { setCurrentVideo, setSubtitles } = useAppStore();
  const [projects, setProjects] = useState<MyLearningProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<MyLearningProject[]>(
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
          project.projectName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.language.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filter) {
      case "recent":
        filtered = filtered.filter(
          (project) =>
            new Date(project.lastAccessed).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        break;
      case "in-progress":
        filtered = filtered.filter(
          (project) =>
            project.learningProgress > 0 &&
            project.learningProgress < project.duration
        );
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.lastAccessed).getTime() -
            new Date(a.lastAccessed).getTime()
        );
        break;
      case "name":
        filtered.sort((a, b) => a.projectName.localeCompare(b.projectName));
        break;
      case "progress":
        filtered.sort(
          (a, b) =>
            b.learningProgress / b.duration - a.learningProgress / a.duration
        );
        break;
      case "duration":
        filtered.sort((a, b) => b.duration - a.duration);
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filter, sortBy]);

  const loadLearningProjects = async () => {
    try {
      setIsLoading(true);
      const learningProjects = await StorageManager.getAllMyLearningProjects();
      setProjects(learningProjects);
    } catch (error) {
      console.error("Error loading learning projects:", error);
      toast.error("Failed to load learning projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (project: MyLearningProject) => {
    try {
      // Load video
      const video = await StorageManager.getVideo(project.videoId);
      if (!video) {
        toast.error("Video not found");
        return;
      }

      // Load subtitles
      const subtitles = await StorageManager.getSubtitles(project.videoId);

      // Set current video and subtitles
      setCurrentVideo(video);
      setSubtitles(subtitles);

      // Update last accessed time
      await StorageManager.updateMyLearningProject(project.videoId, {
        lastAccessed: new Date(),
      });

      // Navigate to main page
      router.push("/");
      toast.success("Project loaded successfully");
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
    }
  };

  const handleDeleteProject = async (project: MyLearningProject) => {
    if (
      !confirm(
        `Are you sure you want to delete "${project.projectName}" from your learning list?`
      )
    ) {
      return;
    }

    try {
      await StorageManager.deleteMyLearningProject(project.videoId);
      await loadLearningProjects(); // Reload the list
      toast.success("Project removed from learning list");
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
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressPercentage = (project: MyLearningProject): number => {
    if (project.duration === 0) return 0;
    return Math.round((project.learningProgress / project.duration) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation
        showBackButton={true}
        backButtonText="Back to Video"
        backButtonHref="/"
        title="My Learning List"
        titleIcon={<BookOpen className="w-4 h-4 text-white" />}
        titleGradient="from-purple-600 to-purple-800"
      />

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
                    {
                      projects.filter((p) => getProgressPercentage(p) > 0)
                        .length
                    }
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
                      projects.reduce((sum, p) => sum + p.duration, 0)
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
                key={project.videoId}
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {project.projectName}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <Languages className="w-4 h-4" />
                        <span className="capitalize">{project.language}</span>
                        <span>•</span>
                        <span>{formatDuration(project.duration)}</span>
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
                      <span>{getProgressPercentage(project)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(project)}%` }}
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
                      <span>{formatDate(project.lastAccessed)}</span>
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
                        router.push(`/subtitles?video=${project.videoId}`)
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
