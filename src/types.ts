export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  tps?: number
  totalTokens?: number
  duration?: number
  timestamp: number
}

export interface OllamaModel {
  name: string
  size: number
  modified_at: string
}

export interface ComparisonResult {
  model: string
  content: string
  tps?: number
  totalTokens?: number
  duration?: number
  status: 'pending' | 'running' | 'done' | 'error'
  error?: string
}

export interface ChatStats {
  tps: number
  totalTokens: number
  duration: number
  content: string
  thinking: string
}

export const PRESET_PROMPTS = [
  { label: '👋 Hello World', prompt: 'Say "Hello World!" and introduce yourself briefly.' },
  { label: '🧮 Math', prompt: 'What is 17 × 23? Show your work step by step.' },
  { label: '🐍 Code: FizzBuzz', prompt: 'Write a Python FizzBuzz from 1 to 30.' },
  { label: '✍️ Creative', prompt: 'Write a 4-line haiku about artificial intelligence.' },
  { label: '🔬 Reasoning', prompt: 'A bat and a ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost? Explain.' },
  { label: '📚 Summarize', prompt: 'Explain the concept of neural networks to a 10-year-old in 3 sentences.' },
  { label: '🚀 Benchmark', prompt: 'List the first 50 prime numbers.' },
  { label: '🌍 Multilingual', prompt: 'Say "Good morning, how are you?" in 5 different languages.' },
]
