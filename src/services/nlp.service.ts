import axios from 'axios';
import 'dotenv/config';

interface ParsedRule {
  name: string;
  description: string;
  conditions: any;
  event: {
    type: string;
    params: Record<string, any>;
  };
  priority?: number;
}

export const parseToRule = async (nlInput: string): Promise<ParsedRule> => {
  const prompt = `
Convert the sentence below into a valid JSON rule compatible with json-rules-engine.
The JSON must contain:
- name: short rule name
- description: short summary
- conditions: using "all" or "any", each having fact, operator, value
- event: with type and params

Only return valid JSON. No markdown. No explanation.

Input: "${nlInput}"
`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('Gemini did not return valid JSON');

    const cleaned = raw
      .replace(/```json|```/g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed as ParsedRule;

  } catch (err: any) {
    console.error('Gemini parsing error:', err.message);
    throw new Error(`NLPService.parseToRule failed: ${err.message}`);
  }
};