import { CANONICAL_CATEGORIES, ExpenseCategory } from '../../types';

export function parseInvoiceFallback(text: string): any {
  const lower = text.toLowerCase();
  
  // Extract amount
  let totalAmount: number | null = null;
  const amountMatch = text.match(/(?:total|amount due|grand total|payable|net|paid)[:\s]*[₹$€£\s]*([0-9,]+(?:\.[0-9]{2})?)/i)
    || text.match(/[₹$€£]\s*([0-9,]+(?:\.[0-9]{2})?)/);
  if (amountMatch) {
    const rawNum = amountMatch[1].replace(/,/g, '');
    totalAmount = parseFloat(rawNum);
  }

  // Extract currency
  let currency = 'INR';
  if (text.includes('$') || text.includes('USD')) currency = 'USD';
  else if (text.includes('€') || text.includes('EUR')) currency = 'EUR';
  else if (text.includes('£') || text.includes('GBP')) currency = 'GBP';
  else if (text.includes('₹') || text.includes('INR')) currency = 'INR';

  // Extract dates (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.)
  let transactionDate = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/) 
    || text.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/)
    || text.match(/\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i);
  
  if (dateMatch) {
    try {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate.toISOString().split('T')[0];
      }
    } catch {
      // Keep today
    }
  }

  // Vendor detection
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let vendor = lines[0] || 'Unknown Merchant';
  if (vendor.toLowerCase().includes('invoice') && lines.length > 1) {
    vendor = lines[1];
  }
  vendor = vendor.replace(/^(invoice to|billed to|from|merchant|vendor)[:\s]*/i, '').trim();

  // Category heuristics
  let category: ExpenseCategory = 'Miscellaneous';
  if (lower.includes('facebook') || lower.includes('meta') || lower.includes('google ads') || lower.includes('advertising') || lower.includes('campaign') || lower.includes('influencer')) {
    category = 'Marketing & Advertising';
  } else if (lower.includes('aws') || lower.includes('cloud') || lower.includes('software') || lower.includes('saas') || lower.includes('shopify') || lower.includes('subscription') || lower.includes('github') || lower.includes('slack') || lower.includes('zoom')) {
    category = 'Software & SaaS';
  } else if (lower.includes('shipping') || lower.includes('delhivery') || lower.includes('courier') || lower.includes('freight') || lower.includes('logistics') || lower.includes('fedex') || lower.includes('bluedart')) {
    category = 'Logistics & Shipping';
  } else if (lower.includes('packaging') || lower.includes('boxes') || lower.includes('raw materials') || lower.includes('inventory') || lower.includes('bottles') || lower.includes('carton')) {
    category = 'Inventory & Raw Materials';
  } else if (lower.includes('chair') || lower.includes('hardware') || lower.includes('laptop') || lower.includes('monitor') || lower.includes('equipment') || lower.includes('macbook')) {
    category = 'Equipment & Hardware';
  } else if (lower.includes('audit') || lower.includes('chartered accountant') || lower.includes('legal') || lower.includes('consulting') || lower.includes('retainer')) {
    category = 'Professional Services';
  } else if (lower.includes('flight') || lower.includes('hotel') || lower.includes('uber') || lower.includes('ola') || lower.includes('travel') || lower.includes('airline')) {
    category = 'Travel';
  } else if (lower.includes('electricity') || lower.includes('rent') || lower.includes('office') || lower.includes('broadband') || lower.includes('maintenance') || lower.includes('utility')) {
    category = 'Rent & Utilities';
  }

  // Invoice Number
  const invoiceNumber = text.match(/(?:invoice|inv|bill|receipt|tax invoice)[\s#:]*([A-Za-z0-9\-_/]+)/i)?.[1] || null;

  return {
    vendor: vendor || 'Unknown Vendor',
    transactionDate,
    invoiceNumber,
    subtotal: totalAmount ? Math.round(totalAmount * 0.82) : null,
    taxAmount: totalAmount ? Math.round(totalAmount * 0.18) : null,
    totalAmount: totalAmount || 1000,
    currency,
    category,
    confidence: totalAmount ? 0.85 : 0.65,
    fieldConfidence: {
      vendor: 0.85,
      transactionDate: 0.80,
      totalAmount: totalAmount ? 0.90 : 0.40,
      currency: 0.95,
      category: 0.85,
    },
    needsReview: !totalAmount,
    reviewReason: !totalAmount ? 'Could not automatically confirm exact total amount from document' : null,
    shortDescription: `${category} expense for ${vendor}`,
    categoryReason: `Classified as ${category} based on document keywords.`,
    rawText: text,
  };
}
