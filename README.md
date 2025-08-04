# FluentReact - Interactive Video Language Learning

**Transform any video into an interactive language learning experience. All processing happens locally on your device for complete privacy.**

## 🎯 What is FluentReact?

FluentReact is a powerful alternative to Language Reactor that works with **any video file** you have. While Language Reactor is limited to Netflix and YouTube, FluentReact opens up a world of possibilities with your own video content.

### ✨ Key Features

- **🎬 Works with Any Video**: Upload your own video files, online courses, or movie collection
- **🔒 Complete Privacy**: All processing happens locally on your device - your videos never leave your computer
- **⚡ Lightning Fast**: No waiting for uploads or downloads. Process videos instantly
- **📚 Interactive Learning**: Click subtitles to play, loop sentences, and build vocabulary
- **🌐 Works Offline**: Learn anywhere, even without internet connection
- **💯 Free**: Currently free to use, no registration required

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fluentreact.git
cd fluentreact

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start learning!

## 🎓 How It Works

1. **Upload Your Video**: Drag and drop any video file (MP4, AVI, MOV, MKV, etc.)
2. **Auto-Generate Subtitles**: Our AI creates accurate subtitles in seconds
3. **Start Learning**: Click subtitles to play, loop sentences, and save words

## 🔧 Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Video Processing**: FFmpeg.wasm
- **Speech Recognition**: AssemblyAI + Whisper
- **Storage**: Local IndexedDB + localStorage
- **State Management**: Zustand

## 🌟 Why Choose FluentReact?

### vs Language Reactor

| Feature             | Language Reactor  | FluentReact      |
| ------------------- | ----------------- | ---------------- |
| Supported Platforms | Netflix, YouTube  | Any video file   |
| Privacy             | Browser extension | Local processing |
| Offline Support     | ❌                | ✅               |
| Your Own Content    | ❌                | ✅               |
| Cost                | $5/month          | Free             |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── how-it-works/      # Tutorial page
│   ├── language-reactor-alternative/  # SEO page
│   ├── faq/               # FAQ page
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── video-player.tsx  # Video player
│   ├── subtitle-list.tsx # Subtitle interface
│   └── ...
├── lib/                  # Utilities and services
│   ├── storage.ts        # Local storage
│   ├── assemblyai-service.ts # Transcription
│   └── ...
└── types/                # TypeScript types
```

## 🔒 Privacy & Security

- **Local Processing**: All video processing happens in your browser
- **No Uploads**: Your videos never leave your device
- **No Tracking**: We don't collect or store your data
- **Open Source**: Transparent code you can audit

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod
```

### Environment Variables

```env
# AssemblyAI (optional - for cloud transcription)
ASSEMBLYAI_API_KEY=your_api_key

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id
```

## 📈 SEO Strategy

FluentReact is optimized for search engines with:

- **Targeted Keywords**: "Language Reactor alternative", "video language learning"
- **Local Processing Focus**: Emphasize privacy and local processing
- **Content Marketing**: Blog posts about language learning techniques
- **Technical SEO**: Fast loading, mobile-friendly, structured data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- **Website**: [fluentreact.com](https://fluentreact.com)
- **Demo**: [Try it now](https://fluentreact.com)
- **Documentation**: [How it works](https://fluentreact.com/how-it-works)
- **FAQ**: [Common questions](https://fluentreact.com/faq)

## 🙏 Acknowledgments

- [Language Reactor](https://www.languagereactor.com/) for inspiration
- [AssemblyAI](https://www.assemblyai.com/) for transcription services
- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

**Made with ❤️ for language learners everywhere**
