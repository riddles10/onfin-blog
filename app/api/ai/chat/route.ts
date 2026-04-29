import { NextRequest } from 'next/server';
import anthropic, { MODEL } from '@/lib/anthropic';
import { SITE_NAME, BRAND_VOICE } from '@/lib/cms-config';

const SYSTEM_PROMPT = `You are ${SITE_NAME}'s AI assistant -- a knowledgeable, friendly expert. You help users with questions related to the site's content and expertise areas. Always be concise, accurate, and helpful. If the user writes in Thai, respond in Thai. If the user writes in English, respond in English. Keep responses under 150 words unless a detailed explanation is genuinely needed.

${BRAND_VOICE}`;

export async function POST(request: NextRequest) {
  try {
    const { messages, context, locale } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (messages.length > 50) {
      return new Response(JSON.stringify({ error: 'Maximum 50 messages allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const msg of messages) {
      if (typeof msg.content === 'string' && msg.content.length > 5000) {
        return new Response(JSON.stringify({ error: 'Each message must be 5000 characters or fewer' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\nContext: ${JSON.stringify(context)}`;
    }
    if (locale === 'th') {
      systemPrompt += '\n\nThe user prefers Thai language. Default to Thai unless they write in English.';
    }

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${event.delta.text}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: [ERROR]\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
