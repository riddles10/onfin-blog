// Runtime AI client. The file is still named `anthropic.ts` and re-exports
// the same default identifier so the 7+ existing call sites
// (`import anthropic, { MODEL } from '@/lib/anthropic'`) don't need to change.
//
// What's actually happening under the hood:
//   - Calls are routed to Deepseek (https://api.deepseek.com), which speaks
//     the OpenAI chat-completions protocol.
//   - This module translates the Anthropic-style request/response shape
//     (system prompt, tools with `input_schema`, response.content blocks
//     with `type: 'tool_use' | 'text'`) to/from the OpenAI shape so the
//     caller experience is preserved.
//
// Why not delete @anthropic-ai/sdk: we want a one-file revert path back to
// Anthropic. The SDK is still installed; restoring the previous version of
// this file is enough to switch back. The `Anthropic` type is re-exported
// below so future code can still reference Anthropic SDK types if needed.

import Anthropic from '@anthropic-ai/sdk'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

type AnthropicTool = {
  name: string
  description?: string
  input_schema: Record<string, unknown>
}

type AnthropicMessage = {
  role: 'user' | 'assistant'
  content: string | Array<{ type: 'text'; text: string }>
}

type CreateParams = {
  model: string
  max_tokens: number
  temperature?: number
  system?: string
  tools?: AnthropicTool[]
  tool_choice?:
    | { type: 'tool'; name: string }
    | { type: 'auto' }
    | { type: 'any' }
  messages: AnthropicMessage[]
}

type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }

type AnthropicResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  model: string
  content: AnthropicContentBlock[]
  stop_reason: string
  stop_sequence: null
  usage: { input_tokens: number; output_tokens: number }
}

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) {
    throw new Error('DEEPSEEK_API_KEY is not set')
  }
  return key
}

async function deepseekCreate(params: CreateParams): Promise<AnthropicResponse> {
  const oaiMessages: Array<{ role: string; content: string }> = []
  if (params.system) oaiMessages.push({ role: 'system', content: params.system })
  for (const m of params.messages) {
    const content =
      typeof m.content === 'string'
        ? m.content
        : m.content
            .map((p) => (p.type === 'text' ? p.text : ''))
            .join('\n')
    oaiMessages.push({ role: m.role, content })
  }

  const oaiTools = params.tools?.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description ?? '',
      parameters: t.input_schema,
    },
  }))

  let oaiToolChoice: unknown
  if (params.tool_choice?.type === 'tool') {
    oaiToolChoice = {
      type: 'function',
      function: { name: params.tool_choice.name },
    }
  } else if (params.tool_choice?.type === 'any') {
    oaiToolChoice = 'required'
  } else if (params.tool_choice?.type === 'auto') {
    oaiToolChoice = 'auto'
  }

  const body: Record<string, unknown> = {
    model: params.model,
    max_tokens: params.max_tokens,
    messages: oaiMessages,
  }
  if (typeof params.temperature === 'number') body.temperature = params.temperature
  if (oaiTools && oaiTools.length > 0) body.tools = oaiTools
  if (oaiToolChoice !== undefined) body.tool_choice = oaiToolChoice

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Deepseek API ${res.status}: ${text.slice(0, 500)}`)
  }

  const data = (await res.json()) as {
    id?: string
    model?: string
    choices: Array<{
      message: {
        content: string | null
        tool_calls?: Array<{
          id: string
          type: 'function'
          function: { name: string; arguments: string }
        }>
      }
      finish_reason: string
    }>
    usage: { prompt_tokens: number; completion_tokens: number }
  }

  const choice = data.choices?.[0]
  if (!choice) {
    throw new Error(
      `Deepseek API returned no choices: ${JSON.stringify(data).slice(0, 300)}`
    )
  }

  const content: AnthropicContentBlock[] = []
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    for (const tc of choice.message.tool_calls) {
      let input: unknown = {}
      try {
        input = JSON.parse(tc.function.arguments)
      } catch {
        // Deepseek occasionally emits not-quite-JSON in tool args.
        // Surface the raw payload so callers can decide how to handle it.
        input = { _raw: tc.function.arguments }
      }
      content.push({
        type: 'tool_use',
        id: tc.id,
        name: tc.function.name,
        input,
      })
    }
  }
  if (choice.message.content) {
    content.push({ type: 'text', text: choice.message.content })
  }

  const stopReasonMap: Record<string, string> = {
    stop: 'end_turn',
    tool_calls: 'tool_use',
    length: 'max_tokens',
    content_filter: 'stop_sequence',
  }
  const stop_reason = stopReasonMap[choice.finish_reason] || choice.finish_reason

  return {
    id: data.id ?? `ds-${Date.now()}`,
    type: 'message',
    role: 'assistant',
    model: data.model ?? params.model,
    content,
    stop_reason,
    stop_sequence: null,
    usage: {
      input_tokens: data.usage?.prompt_tokens ?? 0,
      output_tokens: data.usage?.completion_tokens ?? 0,
    },
  }
}

// `stream` is used only by /api/ai/chat (interactive UI) — not on the
// daily-draft pipeline path. Stubbed to throw rather than silently no-op.
const anthropic = {
  messages: {
    create: deepseekCreate,
    stream: (_params: CreateParams): never => {
      throw new Error(
        'Streaming is not implemented in the Deepseek shim. ' +
          'Disable /api/ai/chat or implement SSE translation here.'
      )
    },
  },
} as unknown as Anthropic

export default anthropic

// Deepseek exposes:
//   - 'deepseek-chat'     → general-purpose, GPT-4-class quality
//   - 'deepseek-reasoner' → R1 reasoning model (higher latency)
// Both MODEL and FAST_MODEL use deepseek-chat — no meaningful speed tier
// to choose between, unlike Sonnet/Haiku on Anthropic.
//
// Revert path: change these back to 'claude-sonnet-4-20250514' and
// 'claude-haiku-4-5' alongside restoring the Anthropic-native client.
export const MODEL = 'deepseek-chat'
export const FAST_MODEL = 'deepseek-chat'

export { Anthropic }
