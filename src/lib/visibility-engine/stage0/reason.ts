import { config } from '../config';

/** Call the Opus-class reasoning model with a system + user prompt. */
export async function reason(
  system: string,
  user: string,
  maxTokens = 4000,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.reasoning.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.reasoning.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(`Anthropic error: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return Array.isArray(data?.content)
    ? data.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n')
    : '';
}
