// Free tiers behind one OpenAI-style chat completions client, tried in order.
// Gemini Flash-Lite goes first: 15 requests a minute per model, with room for
// far more tokens than Groq's 7K input tokens a minute for the whole site. When
// one turns a request away the next gets it, so a visitor only sees "too busy"
// when every one of them is spent.

export interface Provider {
  name: 'gemini' | 'groq';
  url: string;
  model: string;
  apiKey: string;
  /** Request fields that differ per provider. */
  params: Record<string, unknown>;
}

export function configuredProviders(): Provider[] {
  const providers: Provider[] = [];

  // Gemini's free tier meters requests per minute per model, so a second model
  // is a second quota: when the first is spent the next one answers, and Groq
  // only takes over once both are.
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModels = (process.env.GEMINI_MODELS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  for (const model of geminiKey ? geminiModels : []) {
    providers.push({
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      model,
      apiKey: geminiKey!,
      params: {
        // Thinking cannot be switched off on Gemini 3, only kept minimal; it
        // counts against max_tokens, hence the higher cap. Temperature is left
        // at Google's default, which Gemini 3 is tuned for.
        reasoning_effort: 'minimal',
        max_tokens: 1024,
      },
    });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    providers.push({
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'qwen/qwen3.8-27b',
      apiKey: groqKey,
      params: {
        // Groq reserves max_tokens against the per-minute budget up front and
        // does not refund the unused remainder, so an oversized cap costs real
        // throughput. Cards carry most of the detail, so answers stay short.
        max_tokens: 400,
        temperature: 0.6,
      },
    });
  }

  return providers;
}
