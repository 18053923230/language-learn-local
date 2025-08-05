"use client";

import { useState, useEffect } from "react";
import { DataManager } from "@/components/data-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Settings,
  Key,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("assemblyai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your AssemblyAI API key");
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("assemblyai_api_key", apiKey.trim());

      // Validate the API key
      setIsValidating(true);
      const isValid = await validateApiKey(apiKey.trim());

      if (isValid) {
        toast.success("API key saved and validated successfully!");
      } else {
        toast.error("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/validate-assemblyai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });

      return response.ok;
    } catch (error) {
      console.error("API key validation error:", error);
      return false;
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem("assemblyai_api_key");
    setApiKey("");
    toast.success("API key cleared");
  };

  return (
    <div className="min-h-screen">
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
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Settings & Data Management
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Manage Your Learning Data
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Control your data, export your progress, and manage your learning
              settings. Your data is stored locally and you have full control
              over it.
            </p>
          </div>

          {/* AssemblyAI API Key Section */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">
                    AssemblyAI API Key
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Required for video transcription and subtitle generation
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  Required
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tutorial */}
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <div className="flex items-start space-x-3 mb-4">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      How to Get Your Free API Key
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>
                        Visit{" "}
                        <a
                          href="https://www.assemblyai.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                        >
                          AssemblyAI.com
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </li>
                      <li>
                        Sign up for a free account (no credit card required)
                      </li>
                      <li>
                        Get $50 in free credits (approximately 50 hours of
                        transcription)
                      </li>
                      <li>Go to Dashboard → API Keys</li>
                      <li>Copy your API key and paste it below</li>
                    </ol>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Your API key is stored locally and never uploaded to our
                      servers
                    </span>
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="api-key"
                    className="text-blue-900 font-medium"
                  >
                    AssemblyAI API Key
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your AssemblyAI API key"
                      className="pr-20 bg-white border-blue-300 focus:border-blue-500"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-8 w-8 p-0"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSaveApiKey}
                    disabled={isLoading || !apiKey.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isValidating ? "Validating..." : "Save & Validate"}
                  </Button>
                  {apiKey && (
                    <Button
                      variant="outline"
                      onClick={clearApiKey}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Status */}
                {apiKey && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">
                      API key is saved locally
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data Management</CardTitle>
              <CardDescription>
                Export, import, or clear your learning data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataManager />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
