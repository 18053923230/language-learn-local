"use client";

import { Button } from "@/components/ui/button";
import {
  Video,
  Search,
  Download,
  FileText,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function VideoSearchHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                视频生成功能帮助
              </h1>
              <p className="text-gray-600 mt-2">了解如何使用自动视频生成功能</p>
            </div>
            <Link href="/video-search">
              <Button variant="outline" size="sm">
                返回搜索页面
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 功能概述 */}
        <div className="education-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Video className="w-6 h-6 mr-3 text-blue-600" />
            功能概述
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            自动视频生成功能允许您从多个视频的字幕中搜索特定关键词，然后自动生成包含相关片段的学习视频。
            这个功能特别适合语言学习，可以帮助您快速找到并学习特定表达在不同场景下的使用。
          </p>
        </div>

        {/* 工作原理 */}
        <div className="education-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Search className="w-6 h-6 mr-3 text-purple-600" />
            工作原理
          </h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">字幕搜索</h3>
                <p className="text-gray-700">
                  系统会搜索您所有已上传视频的字幕，寻找包含您输入关键词的字幕片段。
                  支持精确匹配、部分匹配和模糊匹配。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">片段提取</h3>
                <p className="text-gray-700">
                  找到匹配的字幕后，系统会提取对应的视频片段，包括音频和视频内容。
                  每个片段都包含完整的学习内容。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">视频生成</h3>
                <p className="text-gray-700">
                  使用先进的视频处理技术，将所有相关片段合并成一个完整的学习视频。
                  支持多种输出格式和质量设置。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 使用场景 */}
        <div className="education-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            使用场景
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">场景学习</h3>
              <p className="text-blue-800 text-sm">
                搜索 "good morning" 可以从多个视频中找到不同场景下的使用方式，
                帮助您理解同一表达在不同语境中的应用。
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">发音练习</h3>
              <p className="text-purple-800 text-sm">
                搜索特定单词或短语，收集所有相关的发音片段，
                创建专门的发音练习视频。
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">语法学习</h3>
              <p className="text-green-800 text-sm">
                搜索特定的语法结构，观察其在真实对话中的使用，
                提升语法应用能力。
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">词汇扩展</h3>
              <p className="text-orange-800 text-sm">
                搜索特定词汇，了解其在不同上下文中的含义和用法，
                扩展词汇量和理解深度。
              </p>
            </div>
          </div>
        </div>

        {/* 输出格式 */}
        <div className="education-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Download className="w-6 h-6 mr-3 text-orange-600" />
            输出格式
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Video className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">视频文件</h3>
                <p className="text-gray-600 text-sm">
                  当有可用的视频文件时，系统会生成 MP4 格式的学习视频，
                  包含所有相关片段的组合。
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">字幕文件</h3>
                <p className="text-gray-600 text-sm">
                  当没有可用的视频文件时，系统会生成 SRT 格式的字幕文件，
                  包含所有匹配的字幕片段和时间轴信息。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="education-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 text-red-600" />
            注意事项
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  视频文件要求
                </h3>
                <p className="text-gray-700 text-sm">
                  要生成完整的视频文件，您需要先上传视频并生成字幕。
                  如果只有字幕数据，系统会生成字幕文件作为替代。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">处理时间</h3>
                <p className="text-gray-700 text-sm">
                  视频生成需要一定时间，具体取决于片段数量和视频长度。
                  请耐心等待处理完成。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Download className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">自动下载</h3>
                <p className="text-gray-700 text-sm">
                  生成完成后，文件会自动下载到您的默认下载文件夹。
                  文件名包含搜索关键词和时间戳。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 使用建议 */}
        <div className="education-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            使用建议
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">关键词选择</h3>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• 使用具体的单词或短语，避免过于宽泛的搜索</li>
                <li>• 尝试不同的表达方式，如 "thank you" 和 "thanks"</li>
                <li>• 使用引号进行精确匹配，如 "how are you"</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">学习策略</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• 从简单词汇开始，逐步学习复杂表达</li>
                <li>• 关注同一表达在不同场景下的使用差异</li>
                <li>• 结合字幕文件进行深度学习和复习</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <Link href="/video-search">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              <Search className="w-5 h-5 mr-2" />
              开始使用视频搜索
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
