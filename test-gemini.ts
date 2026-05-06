import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: 'Hello',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log(res.text);
  } catch (e) {
    console.log(e);
  }
}
run();
