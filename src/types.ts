export const CANONICAL_CATEGORIES = [
  "Marketing & Advertising",
  "Software & SaaS",
  "Inventory & Raw Materials",
  "Logistics & Shipping",
  "Office Supplies",
  "Professional Services",
  "Travel",
  "Meals & Entertainment",
  "Rent & Utilities",
  "Salaries & Contractors",
  "Equipment & Hardware",
  "Banking & Financial Fees",
  "Taxes & Government Fees",
  "Customer Support",
  "Miscellaneous",
] as const;

export type ExpenseCategory = typeof CANONICAL_CATEGORIES[number];

export interface FieldConfidence {
  vendor: number;
  transactionDate: number;
  totalAmount: number;
  currency: number;
  category: number;
}

export interface ValidationIssue {
  field: keyof FieldConfidence | 'subtotal' | 'taxAmount' | 'invoiceNumber' | 'general';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  type?: 'EXACT_INVOICE' | 'VENDOR_AMOUNT_DATE' | 'SIMILAR';
  matchedId?: string;
  matchedVendor?: string;
  matchedAmount?: number;
  matchedDate?: string;
  reason?: string;
}

export interface ParsedInvoiceData {
  vendor: string | null;
  transactionDate: string | null; // ISO YYYY-MM-DD
  invoiceNumber: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  currency: string;
  category: ExpenseCategory;
  confidence: number; // 0.00 - 1.00
  fieldConfidence: FieldConfidence;
  needsReview: boolean;
  reviewReason: string | null;
  shortDescription: string;
  categoryReason?: string | null;
  lineItems?: Array<{ description: string; amount?: number; quantity?: number }>;
  rawText: string;
  validationIssues?: ValidationIssue[];
  duplicateWarning?: DuplicateDetectionResult;
}

export interface LedgerTransaction {
  id: string;
  vendor: string;
  transactionDate: string; // YYYY-MM-DD
  invoiceNumber: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  totalAmount: number;
  currency: string;
  category: ExpenseCategory;
  shortDescription: string;
  status: 'Verified' | 'Needs Review';
  confidence: number;
  fieldConfidence: FieldConfidence;
  reviewReason: string | null;
  rawText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStat {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}

export interface DashboardMetrics {
  totalSpendINR: number;
  totalSpendFormatted: string;
  transactionCount: number;
  vendorCount: number;
  needsReviewCount: number;
  verifiedCount: number;
  averageConfidence: number;
  categoryBreakdown: CategoryStat[];
  largestVendor: { vendor: string; amount: number } | null;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'trend' | 'alert' | 'highlight';
  impact?: 'high' | 'medium' | 'low';
}
