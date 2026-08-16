import { GoogleGenAI, Type } from '@google/genai';
import { parseInvoiceFallback } from '../src/services/ai/fallbackParser';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rawText } = req.body || {};
  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ error: 'rawText is required in request body' });
  }

  const ai = getGemini();

  if (ai) {
    const systemInstruction = `You are an expert financial auditor, bookkeeper, and OCR invoice extraction specialist for Indian & Global direct-to-consumer (D2C) businesses.
Extract structured fields accurately from raw receipts or invoices.
If ambiguous, set needsReview=true and explain in reviewReason.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        vendor: { type: Type.STRING },
        transactionDate: { type: Type.STRING },
        invoiceNumber: { type: Type.STRING },
        subtotal: { type: Type.NUMBER },
        taxAmount: { type: Type.NUMBER },
        totalAmount: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        category: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        fieldConfidence: {
          type: Type.OBJECT,
          properties: {
            vendor: { type: Type.NUMBER },
            transactionDate: { type: Type.NUMBER },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.NUMBER },
            category: { type: Type.NUMBER },
          },
          required: ['vendor', 'transactionDate', 'totalAmount', 'currency', 'category'],
        },
        needsReview: { type: Type.BOOLEAN },
        reviewReason: { type: Type.STRING },
        shortDescription: { type: Type.STRING },
        categoryReason: { type: Type.STRING },
        lineItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
              amount: { type: Type.NUMBER },
            },
            required: ['description', 'amount'],
          },
        },
      },
      required: [
        'vendor',
        'transactionDate',
        'totalAmount',
        'currency',
        'category',
        'confidence',
        'fieldConfidence',
        'needsReview',
        'shortDescription',
      ],
    };

    const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    for (const modelName of models) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: `Parse this raw financial invoice/receipt text and extract all required structured fields:\n\n${rawText}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.1,
          },
        });

        const text = result.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          parsed.rawText = rawText;
          return res.status(200).json(parsed);
        }
      } catch (err: any) {
        console.warn(`[Vercel Serverless] Model ${modelName} error:`, err?.message || err);
      }
    }
  }

  // Fallback if AI not configured or unavailable
  const fallback = parseInvoiceFallback(rawText);
  return res.status(200).json(fallback);
}
