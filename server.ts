import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return genAI;
}

// API Health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'Flash Cart Volta Hyperlocal Platform',
    time: new Date().toISOString()
  });
});

// Gemini AI Market Price Advisor & Product Description Generator
app.post('/api/ai/product-description', async (req, res) => {
  const { productName, category, marketName, unit, basePrice } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'productName is required' });
  }

  const client = getGeminiClient();
  if (!client) {
    // Smart fallback description if API key is not configured yet
    const fallbackDesc = `Fresh, authentic ${productName} directly sourced from local traders at ${marketName || 'Volta Region Market'}. Standard unit: ${unit || 'Per Unit'}. Verified quality and clean packaging for fast dispatch via Flash Cart riders.`;
    return res.json({ description: fallbackDesc, priceSuggestion: basePrice ? `₵${basePrice}` : 'Market competitive' });
  }

  try {
    const prompt = `You are an expert Ghanaian market trade advisor specializing in Volta Region hyperlocal markets (Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, Aflao).
Create an enticing, authentic 2-3 sentence commercial product description in Ghana Cedi (₵) context for a trader listing:
- Product Name: ${productName}
- Category: ${category || 'General Market Produce'}
- Market: ${marketName || 'Akatsi Main Market'}
- Unit: ${unit || 'Per Olonka / Rubber'}
- Offered Price: GHS ${basePrice || 'N/A'}

Format output in JSON with two keys:
1. "description": short compelling product description
2. "priceAdvice": a quick 1-sentence market pricing insight for this item in Volta markets.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    let parsedJson = { description: text, priceAdvice: 'Good market value.' };
    try {
      parsedJson = JSON.parse(text);
    } catch (e) {
      // ignore parse error if raw text
    }

    return res.json(parsedJson);
  } catch (error: any) {
    console.error('Error in Gemini API call:', error);
    return res.json({
      description: `Fresh quality ${productName} available at ${marketName || 'Volta Market'}. Sourced with high hygiene standards.`,
      priceAdvice: 'Fair local market rate.'
    });
  }
});

// AI Chatbot / Smart Market Assistant
app.post('/api/ai/market-assistant', async (req, res) => {
  const { query, currentMarket } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      reply: `Flash Cart AI Assistant (Offline Mode): For ${currentMarket || 'Volta markets'}, top seasonal picks are Akatsi Gari, Dabala fresh Tilapia & Adovi clams, Mafi white maize, and Agbozume Kente textiles. Delivery takes 15-30 minutes by verified Okada riders!`
    });
  }

  try {
    const prompt = `You are Flash Cart AI, an energetic, friendly Ghanaian market shopping assistant for the Volta Region (Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, Aflao markets).
User asked: "${query}"
Context Market: ${currentMarket || 'All Volta Markets'}.
Answer in 2-3 helpful, friendly sentences with local terms like "Efo", "Mawu ne yra wo", "Olonka", "Akatsi Gari", "Volta Tilapia", or Ghana Cedi (₵) details.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return res.json({ reply: response.text });
  } catch (err) {
    return res.json({
      reply: 'Mawu ne yra wo! Flash Cart delivers fresh food and items from Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, and Aflao directly to your doorstep with GPS digital addresses.'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Flash Cart server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
