"use client";

import { DataManager } from "@/components/data-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
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
        <div className="space-y-6">
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

          <div className="education-card p-8">
            <DataManager />
          </div>
        </div>
      </main>
    </div>
  );
}
