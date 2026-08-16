import {
  LedgerTransaction,
  ParsedInvoiceData,
} from '../../types';
import { checkDuplicateInvoice } from '../validation/duplicateDetector';
import { runValidationEngine } from '../validation/validationEngine';
import { parseInvoiceFallback } from './fallbackParser';

export interface ParseProgressCallback {
  (step: string, percent: number): void;
}

/**
 * Orchestrates the full AI Extraction -> Validation -> Duplicate Detection pipeline.
 * Robust across local dev, Docker containers, and static/serverless Vercel deployments.
 */
export async function parseInvoiceText(
  rawText: string,
  existingTransactions: LedgerTransaction[],
  onProgress?: ParseProgressCallback
): Promise<ParsedInvoiceData> {
  if (!rawText || rawText.trim() === '') {
    throw new Error('Please paste or select receipt text to analyze.');
  }

  // Visual progressive feedback
  onProgress?.('Reading invoice text & OCR tokens...', 20);
  await new Promise(r => setTimeout(r, 120));

  onProgress?.('Connecting to Gemini AI semantic extraction...', 45);

  let rawParsed: any = null;
  try {
    const response = await fetch('/api/parse-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        rawParsed = await response.json();
      }
    }
  } catch (networkErr) {
    console.warn('Backend /api/parse-invoice unavailable; using resilient client-side extraction engine:', networkErr);
  }

  // If server-side extraction was unavailable (e.g. static hosting on Vercel or quota limits), use deterministic client parser
  if (!rawParsed || !rawParsed.vendor) {
    console.info('Running client-side deterministic invoice analysis engine...');
    rawParsed = parseInvoiceFallback(rawText);
  }

  onProgress?.('Classifying expense & verifying line items...', 70);
  await new Promise(r => setTimeout(r, 100));

  onProgress?.('Running mathematical & date validation...', 85);

  // 1. Run deterministic validation engine
  const validationResult = runValidationEngine(rawParsed);

  // 2. Duplicate Detection
  const candidateForDuplicateCheck: Partial<ParsedInvoiceData> = {
    vendor: rawParsed.vendor,
    invoiceNumber: rawParsed.invoiceNumber,
    totalAmount: rawParsed.totalAmount,
    transactionDate: validationResult.normalizedDate || rawParsed.transactionDate,
  };

  const duplicateResult = checkDuplicateInvoice(
    candidateForDuplicateCheck,
    existingTransactions
  );

  onProgress?.('Finalizing review model...', 100);

  // Merge everything into final structure
  const finalNeedsReview = validationResult.needsReview || duplicateResult.isDuplicate;
  
  let finalReviewReason = validationResult.reviewReason;
  if (duplicateResult.isDuplicate && duplicateResult.reason) {
    finalReviewReason = finalReviewReason
      ? `${finalReviewReason}. Duplicate warning: ${duplicateResult.reason}`
      : duplicateResult.reason;
  }

  const finalParsed: ParsedInvoiceData = {
    vendor: rawParsed.vendor ?? null,
    transactionDate: validationResult.normalizedDate ?? rawParsed.transactionDate ?? null,
    invoiceNumber: rawParsed.invoiceNumber ?? null,
    subtotal: typeof rawParsed.subtotal === 'number' ? rawParsed.subtotal : null,
    taxAmount: typeof rawParsed.taxAmount === 'number' ? rawParsed.taxAmount : null,
    totalAmount: typeof rawParsed.totalAmount === 'number' ? rawParsed.totalAmount : null,
    currency: (rawParsed.currency || 'INR').toUpperCase(),
    category: validationResult.normalizedCategory,
    confidence: validationResult.overallConfidence,
    fieldConfidence: validationResult.fieldConfidence,
    needsReview: finalNeedsReview,
    reviewReason: finalReviewReason,
    shortDescription: rawParsed.shortDescription || `Expense for ${rawParsed.vendor || 'Vendor'}`,
    categoryReason: rawParsed.categoryReason || null,
    lineItems: rawParsed.lineItems || [],
    rawText: rawText,
    validationIssues: validationResult.validationIssues,
    duplicateWarning: duplicateResult,
  };

  return finalParsed;
}
