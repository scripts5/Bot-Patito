import { config } from '../config.js';
import { apis } from '../config/apis.js';
import { withTimeout } from '../utils/hooks.js';
import { logger } from '../utils/logger.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversations = new Map<string, ChatMessage[]>();
const MAX_HISTORY = 10;

export const aiService = {
  isAvailable(): boolean {
    return config.XAI_API_KEY !== null;
  },

  async ask(userId: string, prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('A funcionalidade de IA está desativada (XAI_API_KEY não configurada).');
    }

    const trimmedPrompt = prompt.slice(0, apis.xai.maxCharsPerRequest);
    const history = conversations.get(userId) ?? [];
    const messages: ChatMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...history,
      { role: 'user', content: trimmedPrompt },
    ];

    const response = await withTimeout(
      fetch(`${apis.xai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: apis.xai.model,
          messages,
        }),
      }),
      apis.xai.timeoutMs,
      'A IA demorou demais para responder.'
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      logger.error('aiService', `xAI respondeu com status ${response.status}: ${text}`);
      throw new Error('O serviço de IA recusou a solicitação. Tente novamente mais tarde.');
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('A IA não retornou uma resposta válida.');

    const newHistory = [...history, { role: 'user' as const, content: trimmedPrompt }, { role: 'assistant' as const, content: reply }];
    conversations.set(userId, newHistory.slice(-MAX_HISTORY));

    return reply;
  },

  clearConversation(userId: string): void {
    conversations.delete(userId);
  },
};
