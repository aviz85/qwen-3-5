# Qwen3.5 Playground

A fast, local web UI for chatting with and comparing [Qwen3](https://qwenlm.github.io/blog/qwen3/) models via [Ollama](https://ollama.com). Everything runs on your machine — no API keys, no cloud, 100% private.

## Features

| | |
|---|---|
| 💬 **Chat** | Streaming responses with Qwen3's chain-of-thought thinking mode |
| ⚖️ **Compare** | Run the same prompt across all models sequentially, side-by-side results |
| 🗂️ **Conversation history** | Auto-saved to browser IndexedDB — persists across reloads |
| 📊 **Metrics** | Tokens/sec, total tokens, duration per response |
| 🔄 **RTL support** | Per-paragraph auto-detection for Hebrew / Arabic |
| 🌙 **Dark / light mode** | Follows system preference, persisted in localStorage |
| ⚡ **Preset prompts** | One-click benchmarks: math, code, reasoning, creative, multilingual |

## Screenshots

> Chat mode with thinking trace expanded

![Chat](https://raw.githubusercontent.com/aviz85/qwen-3-5/main/docs/chat.png)

> Compare mode — all models run sequentially

![Compare](https://raw.githubusercontent.com/aviz85/qwen-3-5/main/docs/compare.png)

## Requirements

- [Node.js](https://nodejs.org) 18+
- [Ollama](https://ollama.com) running locally

## 1 — Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Start the server
ollama serve
```

## 2 — Pull Models

Pull whichever sizes fit your hardware. The app auto-detects all `qwen*` models.

```bash
ollama pull qwen3:0.6b    # ~400 MB  — fastest
ollama pull qwen3:1.7b    # ~1.1 GB
ollama pull qwen3:4b      # ~2.6 GB
ollama pull qwen3:8b      # ~5.2 GB  — recommended for M-series Macs
ollama pull qwen3:14b     # ~9 GB
ollama pull qwen3:32b     # ~20 GB   — best quality, needs 32 GB+ RAM
```

> **Apple Silicon:** Metal GPU acceleration is used automatically by Ollama.

## 3 — Run the App

```bash
git clone https://github.com/aviz85/qwen-3-5.git
cd qwen-3-5
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Usage

### Chat Mode
1. Select a model from the model bar
2. Toggle **Thinking ON/OFF** — enables Qwen3's extended chain-of-thought reasoning
3. Type a message or pick a preset prompt (Enter to send, Shift+Enter for newline)
4. Click the amber thinking block to expand/collapse the reasoning trace
5. Conversations auto-save — browse history from the **☰ sidebar**

### Compare Mode
1. Click **Compare** in the header (centered tab)
2. Enter a prompt or pick a preset
3. Click **Run All** — models run one at a time to avoid overloading your machine
4. Results appear side-by-side with per-model TPS, token count, and duration
5. Click **Stop** to abort mid-run

### Conversation Sidebar
- Click **☰** (top-left) to open the panel
- Click **New conversation** to start fresh
- Hover any conversation → **🗑** to delete it
- **Clear all** at the bottom (with confirmation)

## Tech Stack

- [Vite](https://vitejs.dev) + [React](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Ollama Chat API](https://github.com/ollama/ollama/blob/main/docs/api.md) — local streaming
- [Lucide React](https://lucide.dev) icons
- IndexedDB (native browser API) for conversation persistence

## License

MIT
