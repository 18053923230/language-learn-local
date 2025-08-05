"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorageManager } from "@/lib/storage";
import { toast } from "sonner";

export default function DebugStoragePage() {
  const [isClearing, setIsClearing] = useState(false);

  const clearMyList = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all My List data? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch("/api/clear-my-list", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Cleared ${result.clearedCount} learning projects`);
      } else {
        toast.error("Failed to clear My List data");
      }
    } catch (error) {
      console.error("Error clearing My List:", error);
      toast.error("Failed to clear My List data");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Storage</h1>

      <Card>
        <CardHeader>
          <CardTitle>My List Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={clearMyList}
            disabled={isClearing}
            variant="destructive"
          >
            {isClearing ? "Clearing..." : "Clear All My List Data"}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            This will remove all learning projects from My List for testing
            purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
