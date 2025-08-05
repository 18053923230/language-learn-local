import { Navigation } from "@/components/navigation";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Loading Animation */}
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loading...
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Please wait while we prepare your learning experience.
            </p>

            {/* Loading Indicators */}
            <div className="space-y-4 mb-12">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>

            {/* Loading Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                While You Wait
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🎯 Prepare Your Video
                  </h3>
                  <p className="text-sm text-gray-600">
                    Make sure your video file is ready. Supported formats: MP4,
                    AVI, MOV, MKV, WebM
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🌍 Choose Language
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select the video language for optimal transcription and
                    learning experience
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    📚 Learning Tips
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check out our blog for effective language learning
                    techniques and strategies
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🔧 Need Help?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visit our help section for step-by-step guides and
                    troubleshooting
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Loading times may vary depending on your
                internet connection and file size.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
