import {
  CANONICAL_CATEGORIES,
  ExpenseCategory,
  FieldConfidence,
  ParsedInvoiceData,
  ValidationIssue,
} from '../../types';

export interface ValidationEngineResult {
  isValid: boolean;
  needsReview: boolean;
  reviewReason: string | null;
  overallConfidence: number;
  fieldConfidence: FieldConfidence;
  validationIssues: ValidationIssue[];
  normalizedDate: string | null;
  normalizedCategory: ExpenseCategory;
}

/**
 * Normalizes and validates dates into YYYY-MM-DD format.
 * Detects ambiguous formats (e.g. 03/04/2026).
 */
export function normalizeDate(dateStr: string | null | undefined): {
  date: string | null;
  isAmbiguous: boolean;
  issue?: string;
} {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return { date: null, isAmbiguous: false, issue: 'Transaction date could not be identified' };
  }

  const clean = dateStr.trim();

  // Already standard ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return { date: clean, isAmbiguous: false };
    }
  }

  // Month names pattern: e.g. "12 Aug 2026", "August 12, 2026", "12-August-2026"
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];
  const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // Check for month name in string
  const lower = clean.toLowerCase();
  for (let i = 0; i < 12; i++) {
    const full = monthNames[i];
    const short = shortMonths[i];
    if (lower.includes(full) || lower.includes(short)) {
      const parsed = new Date(clean);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return { date: `${y}-${m}-${day}`, isAmbiguous: false };
      }
    }
  }

  // Slash/dot/dash separated numbers e.g. 12/08/2026 or 03/04/2026
  const slashMatch = clean.match(/^(\d{1,4})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    let p3 = parseInt(slashMatch[3], 10);
    if (p3 < 100) p3 += 2000; // 26 -> 2026

    // Case 1: YYYY/MM/DD
    if (p1 > 1000) {
      const month = String(p2).padStart(2, '0');
      const day = String(p3).padStart(2, '0');
      return { date: `${p1}-${month}-${day}`, isAmbiguous: false };
    }

    // Case 2: DD/MM/YYYY vs MM/DD/YYYY
    if (p1 > 12 && p2 <= 12) {
      // Must be DD/MM/YYYY
      return {
        date: `${p3}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`,
        isAmbiguous: false,
      };
    } else if (p2 > 12 && p1 <= 12) {
      // Must be MM/DD/YYYY
      return {
        date: `${p3}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`,
        isAmbiguous: false,
      };
    } else if (p1 <= 12 && p2 <= 12) {
      // Ambiguous! e.g. 03/04/2026 could be March 4 or April 3. Default to DD/MM/YYYY (standard in India/Europe), but mark ambiguous!
      return {
        date: `${p3}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`,
        isAmbiguous: true,
        issue: `Date '${clean}' is ambiguous (${p1}/${p2} vs ${p2}/${p1}). Please verify day and month.`,
      };
    }
  }

  const fallback = new Date(clean);
  if (!isNaN(fallback.getTime())) {
    const y = fallback.getFullYear();
    const m = String(fallback.getMonth() + 1).padStart(2, '0');
    const day = String(fallback.getDate()).padStart(2, '0');
    return { date: `${y}-${m}-${day}`, isAmbiguous: false };
  }

  return { date: null, isAmbiguous: false, issue: `Unrecognized date format: '${clean}'` };
}

/**
 * Validates parsed invoice data with deterministic mathematical and sanity rules.
 */
export function runValidationEngine(raw: Partial<ParsedInvoiceData>): ValidationEngineResult {
  const issues: ValidationIssue[] = [];
  const fieldConf: FieldConfidence = {
    vendor: raw.fieldConfidence?.vendor ?? (raw.vendor ? 0.95 : 0.2),
    transactionDate: raw.fieldConfidence?.transactionDate ?? (raw.transactionDate ? 0.95 : 0.2),
    totalAmount: raw.fieldConfidence?.totalAmount ?? (raw.totalAmount ? 0.95 : 0.2),
    currency: raw.fieldConfidence?.currency ?? 0.95,
    category: raw.fieldConfidence?.category ?? 0.90,
  };

  let needsReview = false;
  const reviewReasons: string[] = [];

  // 1. Vendor Validation
  if (!raw.vendor || raw.vendor.trim() === '' || raw.vendor.toLowerCase() === 'null') {
    issues.push({
      field: 'vendor',
      severity: 'error',
      message: 'Vendor/Merchant name could not be identified.',
    });
    fieldConf.vendor = Math.min(fieldConf.vendor, 0.3);
    needsReview = true;
    reviewReasons.push('Missing vendor name');
  } else {
    const suspiciousVendors = ['customer', 'invoice', 'receipt', 'bill', 'bank', 'payment gateway', 'tax invoice'];
    if (suspiciousVendors.includes(raw.vendor.toLowerCase().trim())) {
      issues.push({
        field: 'vendor',
        severity: 'warning',
        message: `Extracted vendor "${raw.vendor}" looks generic or like a document label.`,
      });
      fieldConf.vendor = Math.min(fieldConf.vendor, 0.6);
      needsReview = true;
      reviewReasons.push('Vendor appears to be a generic label');
    }
  }

  // 2. Date Validation & Normalization
  const dateNorm = normalizeDate(raw.transactionDate);
  const normalizedDate = dateNorm.date;
  if (!normalizedDate) {
    issues.push({
      field: 'transactionDate',
      severity: 'error',
      message: dateNorm.issue || 'Transaction date is missing or could not be formatted.',
    });
    fieldConf.transactionDate = Math.min(fieldConf.transactionDate, 0.25);
    needsReview = true;
    reviewReasons.push('Missing or invalid transaction date');
  } else {
    if (dateNorm.isAmbiguous) {
      issues.push({
        field: 'transactionDate',
        severity: 'warning',
        message: dateNorm.issue || 'Date format is ambiguous. Please verify the invoice date.',
      });
      fieldConf.transactionDate = Math.min(fieldConf.transactionDate, 0.70);
      needsReview = true;
      reviewReasons.push('Ambiguous date format (verify day vs month)');
    }
  }

  // 3. Amount & Mathematical Consistency
  const total = typeof raw.totalAmount === 'number' ? raw.totalAmount : null;
  const subtotal = typeof raw.subtotal === 'number' ? raw.subtotal : null;
  const tax = typeof raw.taxAmount === 'number' ? raw.taxAmount : null;

  if (total === null || isNaN(total) || total <= 0) {
    issues.push({
      field: 'totalAmount',
      severity: 'error',
      message: 'Total amount is missing or not a positive number.',
    });
    fieldConf.totalAmount = Math.min(fieldConf.totalAmount, 0.2);
    needsReview = true;
    reviewReasons.push('Missing or invalid total amount');
  } else {
    // Math validation: subtotal + tax should approximate totalAmount
    if (subtotal !== null && tax !== null && subtotal > 0 && tax >= 0) {
      const calculatedTotal = subtotal + tax;
      const discrepancy = Math.abs(calculatedTotal - total);
      // Allow up to 1.5 currency unit rounding tolerance
      if (discrepancy > 1.5) {
        issues.push({
          field: 'totalAmount',
          severity: 'warning',
          message: `Mathematical mismatch: Subtotal (${subtotal}) + Tax (${tax}) = ${calculatedTotal}, which differs from Total (${total}) by ${discrepancy.toFixed(2)}.`,
        });
        fieldConf.totalAmount = Math.min(fieldConf.totalAmount, 0.65);
        needsReview = true;
        reviewReasons.push(`Subtotal + Tax mismatch (${subtotal} + ${tax} ≠ ${total})`);
      }
    }
  }

  // 4. Category Canonical Check
  let normalizedCategory: ExpenseCategory = 'Miscellaneous';
  if (raw.category && CANONICAL_CATEGORIES.includes(raw.category as ExpenseCategory)) {
    normalizedCategory = raw.category as ExpenseCategory;
  } else if (raw.category) {
    // Try to find closest match
    const found = CANONICAL_CATEGORIES.find(c => c.toLowerCase() === (raw.category || '').toLowerCase());
    if (found) {
      normalizedCategory = found;
    } else {
      issues.push({
        field: 'category',
        severity: 'warning',
        message: `Category "${raw.category}" is not in the canonical list. Defaulted to Miscellaneous.`,
      });
      fieldConf.category = Math.min(fieldConf.category, 0.6);
      needsReview = true;
      reviewReasons.push('Non-standard expense category assigned');
    }
  } else {
    issues.push({
      field: 'category',
      severity: 'warning',
      message: 'No expense category identified.',
    });
    fieldConf.category = 0.5;
    needsReview = true;
    reviewReasons.push('Unclassified expense category');
  }

  // 5. Currency Check
  const curr = (raw.currency || 'INR').toUpperCase().trim();
  if (!curr || curr.length < 2 || curr.length > 4) {
    issues.push({
      field: 'currency',
      severity: 'warning',
      message: `Unusual currency symbol or code: "${raw.currency}". Defaulted to INR.`,
    });
    fieldConf.currency = Math.min(fieldConf.currency, 0.6);
  }

  // Calculate Weighted Overall Confidence
  // Weights: totalAmount: 0.30, vendor: 0.25, transactionDate: 0.20, category: 0.15, currency: 0.10
  let calculatedOverall =
    fieldConf.totalAmount * 0.30 +
    fieldConf.vendor * 0.25 +
    fieldConf.transactionDate * 0.20 +
    fieldConf.category * 0.15 +
    fieldConf.currency * 0.10;

  // Penalize for critical issues
  if (issues.some(i => i.severity === 'error')) {
    calculatedOverall = Math.min(calculatedOverall, 0.65);
    needsReview = true;
  }

  if (calculatedOverall < 0.80) {
    needsReview = true;
    if (reviewReasons.length === 0) {
      reviewReasons.push('Overall AI extraction confidence is below 80%');
    }
  }

  // Explicit AI-provided review request check
  if (raw.needsReview && raw.reviewReason && !reviewReasons.includes(raw.reviewReason)) {
    reviewReasons.push(raw.reviewReason);
    needsReview = true;
  }

  return {
    isValid: !issues.some(i => i.severity === 'error'),
    needsReview,
    reviewReason: reviewReasons.length > 0 ? reviewReasons.join('. ') : null,
    overallConfidence: Math.round(calculatedOverall * 100) / 100,
    fieldConfidence: fieldConf,
    validationIssues: issues,
    normalizedDate,
    normalizedCategory,
  };
}
