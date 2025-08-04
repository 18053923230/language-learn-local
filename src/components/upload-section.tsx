"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Globe, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
}

export function UploadSection({ onFileUpload }: UploadSectionProps) {
  const router = useRouter();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Call the parent handler
    onFileUpload(file);

    // Navigate to the main page where video processing happens
    router.push("/");
  };

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Learning in Seconds
          </h2>
          <p className="text-lg text-gray-600">
            Upload any video file and instantly create interactive language
            lessons
          </p>
        </div>

        <Card className="border-2 border-dashed border-blue-300 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Drop Your Video Here
            </h3>

            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Supported formats: MP4, AVI, MOV, MKV, WebM and more. Maximum file
              size: 2GB
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-lg"
                onClick={() =>
                  document.getElementById("file-upload-prominent")?.click()
                }
              >
                <Upload className="w-6 h-6 mr-2" />
                Choose Video File
              </Button>
              <input
                id="file-upload-prominent"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-blue-300 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  // Simulate drag and drop area click
                  document.getElementById("file-upload-prominent")?.click();
                }}
              >
                <Globe className="w-6 h-6 mr-2" />
                Or Drag & Drop
              </Button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>Instant Processing</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1 text-blue-500" />
                  <span>Works Offline</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
