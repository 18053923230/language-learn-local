"use client";

import { useState } from "react";

export default function SimpleTestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Event Test</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">HTML Button Test</h2>
            <button
              onClick={() => {
                console.log("HTML button clicked!");
                alert("HTML button works!");
                setCount(count + 1);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Click me! Count: {count}
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Div Click Test</h2>
            <div
              onClick={() => {
                console.log("Div clicked!");
                alert("Div click works!");
              }}
              className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600"
            >
              Click this div
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Video Container Test</h2>
            <div
              className="bg-black rounded-lg overflow-hidden relative"
              style={{ height: "200px" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    console.log("Video container button clicked!");
                    alert("Video container button works!");
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-10"
                >
                  Test Button in Video Container
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
