# Qwen3.5 Playground

A local web UI for chatting with and comparing Qwen3 models running via [Ollama](https://ollama.com). Fully private — no internet required after setup.

## Features

- **Chat** — streaming responses with thinking mode (Qwen3's extended reasoning)
- **Compare** — run the same prompt on all models sequentially, results side by side with metrics
- **Conversation history** — saved in browser IndexedDB, survives page reloads
- **Metrics** — tokens/sec, total tokens, duration per response
- **RTL support** — auto-detects Hebrew/Arabic paragraphs and aligns right
- **Dark / light mode** — persisted across sessions
- **Preset prompts** — quick benchmarks: math, code, reasoning, creative, multilingual

## Requirements

- [Node.js](https://nodejs.org) 18+
- [Ollama](https://ollama.com) running locally

## Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Start the Ollama server
ollama serve
```

## Pull Models

Pull whichever sizes fit your hardware. The app auto-detects all `qwen*` models.

```bash
ollama pull qwen3:0.6b    # ~400 MB  — fastest, great for quick tests
ollama pull qwen3:1.7b    # ~1.1 GB
ollama pull qwen3:4b      # ~2.6 GB
ollama pull qwen3:8b      # ~5.2 GB  — recommended for M-series Macs
ollama pull qwen3:14b     # ~9 GB
ollama pull qwen3:32b     # ~20 GB   — best quality, needs 32 GB+ RAM
```

> **Tip:** On Apple Silicon, Metal GPU acceleration is used automatically.

## Run the App

```bash
git clone https://github.com/avizmaeir/qwen-3-5.git
cd qwen-3-5
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Usage

### Chat Mode
1. Select a model from the top bar
2. Toggle **Thinking ON/OFF** — enables Qwen3's chain-of-thought reasoning
3. Type a message or pick a preset prompt
4. Click the thinking block to expand/collapse the reasoning trace
5. Past conversations are saved automatically and accessible from the sidebar

### Compare Mode
1. Click **Compare** in the header
2. Enter a prompt (or pick a preset)
3. Click **Run All** — each model runs one by one to avoid overloading your machine
4. Results appear side by side with per-model TPS, tokens, and duration

## Tech Stack

- [Vite](https://vitejs.dev) + [React](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md) (local, streaming)
- [Lucide React](https://lucide.dev) icons
- IndexedDB for local conversation persistence

## License

MIT
