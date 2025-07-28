"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Video,
  Search,
  Play,
  Download,
  BookOpen,
  Globe,
  Target,
  Zap,
  Users,
  Clock,
} from "lucide-react";

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: "single-video",
      title: "单视频字幕过滤",
      description:
        "从当前视频的395条字幕中过滤出包含特定关键词的字幕，自动生成学习视频",
      icon: <Video className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      examples: [
        "输入 'letter' → 找到35条相关字幕 → 生成学习视频",
        "输入 'good morning' → 找到12条相关字幕 → 生成场景视频",
        "输入 'pronunciation' → 找到28条相关字幕 → 生成发音练习视频",
      ],
    },
    {
      id: "multi-video",
      title: "多视频字幕搜索",
      description:
        "从几十部视频的字幕库中搜索包含指定单词或句子的字幕，组合成场景学习视频",
      icon: <Search className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      examples: [
        "搜索 'good morning' → 从15个视频中找到42个场景 → 生成场景学习视频",
        "搜索 'thank you' → 从8个视频中找到23个场景 → 生成礼貌用语视频",
        "搜索 'how are you' → 从12个视频中找到31个场景 → 生成问候语视频",
      ],
    },
    {
      id: "scene-learning",
      title: "场景学习视频",
      description: "让学习者感受特定短语在不同场景下的使用，提升语言应用能力",
      icon: <Target className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      examples: [
        "'good morning' 在办公室、家庭、商店等不同场景的使用",
        "'excuse me' 在道歉、请求、打断等不同语境的应用",
        "'I love you' 在家人、朋友、恋人等不同关系的表达",
      ],
    },
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "高效学习",
      description: "通过关键词快速定位相关学习内容，节省搜索时间",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "场景化学习",
      description: "从多个视频中收集同一表达的不同使用场景，提升应用能力",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "个性化学习",
      description: "根据学习需求生成定制化学习视频，提高学习效率",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "自动化流程",
      description: "一键生成学习视频，减少手动操作，专注学习内容",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                自动视频生成功能演示
              </h1>
              <p className="text-gray-600 mt-2">
                展示如何通过字幕过滤和搜索自动生成个性化学习视频
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  返回主页
                </Button>
              </Link>
              <Link href="/test-video-generation">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  开始测试
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            智能视频生成，提升语言学习效率
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            通过先进的字幕搜索和视频处理技术，自动从您的视频库中提取相关片段，
            生成个性化的学习视频，让语言学习更加高效和有趣。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`education-card p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                activeFeature === feature.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() =>
                setActiveFeature(
                  activeFeature === feature.id ? null : feature.id
                )
              }
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
              >
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {activeFeature === feature.id && (
                <div
                  className={`bg-gradient-to-r ${feature.bgColor} rounded-lg p-4 mt-4`}
                >
                  <h4 className="font-semibold text-gray-900 mb-3">
                    使用示例：
                  </h4>
                  <ul className="space-y-2">
                    {feature.examples.map((example, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start space-x-2"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="education-card p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            核心优势
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="text-white">{benefit.icon}</div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Section */}
        <div className="education-card p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            工作流程
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">输入关键词</h4>
              <p className="text-sm text-gray-600">输入您想学习的单词或短语</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">智能搜索</h4>
              <p className="text-sm text-gray-600">系统自动搜索相关字幕片段</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">视频生成</h4>
              <p className="text-sm text-gray-600">自动提取和组合视频片段</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">开始学习</h4>
              <p className="text-sm text-gray-600">下载并观看个性化学习视频</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="education-card p-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              准备开始体验？
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              立即尝试自动视频生成功能，体验智能化的语言学习方式。
              上传您的视频，输入关键词，让系统为您生成个性化的学习内容。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/test-video-generation">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                  <Video className="w-5 h-5 mr-2" />
                  开始测试
                </Button>
              </Link>
              <Link href="/video-search">
                <Button variant="outline" className="px-8 py-3">
                  <Search className="w-5 h-5 mr-2" />
                  多视频搜索
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
