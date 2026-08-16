import { GoogleGenAI, Type } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

function generateFallbackInsights(transactions: any[]): any[] {
  if (!transactions.length) return [];
  const total = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const needsReview = transactions.filter(t => t.status === 'Needs Review');
  
  const insights: any[] = [];
  if (needsReview.length > 0) {
    insights.push({
      id: 'ins-review',
      title: 'Transactions Requiring Review',
      description: `${needsReview.length} transaction${needsReview.length > 1 ? 's' : ''} flagged for review before month-end book close.`,
      type: 'alert',
      impact: 'high',
    });
  }

  const catSpend: Record<string, number> = {};
  transactions.forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.totalAmount;
  });
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
  if (topCat && total > 0) {
    const pct = Math.round((topCat[1] / total) * 100);
    insights.push({
      id: 'ins-top-cat',
      title: `${topCat[0]} Concentration`,
      description: `${topCat[0]} represents ${pct}% (₹${topCat[1].toLocaleString()}) of total recorded expenses.`,
      type: 'trend',
      impact: 'medium',
    });
  }

  return insights;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactions = [] } = req.body || {};
  const ai = getGemini();

  if (ai && Array.isArray(transactions) && transactions.length > 0) {
    const summaryText = transactions
      .map(t => `${t.transactionDate} | ${t.vendor} | ${t.category} | ${t.currency} ${t.totalAmount} | Status: ${t.status}`)
      .join('\n');

    const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Analyze these ledger transactions for a D2C brand finance close and produce 3-4 high-value executive insights:\n${summaryText}\n\nReturn JSON with id, title, description, type, impact.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ['id', 'title', 'description', 'type', 'impact'],
              },
            },
            temperature: 0.2,
          },
        });

        const insights = JSON.parse(response.text?.trim() || '[]');
        if (Array.isArray(insights) && insights.length > 0) {
          return res.status(200).json({ insights });
        }
      } catch (err: any) {
        console.warn(`[Vercel Serverless] Insights ${modelName} error:`, err?.message || err);
      }
    }
  }

  return res.status(200).json({ insights: generateFallbackInsights(transactions) });
}
