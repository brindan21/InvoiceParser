import {
  CategoryStat,
  DashboardMetrics,
  ExpenseCategory,
  LedgerTransaction,
} from '../../types';

const STORAGE_KEY = 'ledger_ai_transactions_v1';

export const INITIAL_SAMPLE_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx-001',
    vendor: 'Google India Pvt Ltd',
    transactionDate: '2026-08-14',
    invoiceNumber: 'GOOG-IN-88910',
    subtotal: 63559.32,
    taxAmount: 11440.68,
    totalAmount: 75000,
    currency: 'INR',
    category: 'Marketing & Advertising',
    shortDescription: 'Google Performance Max & Search ad campaigns for festive launch',
    status: 'Verified',
    confidence: 0.98,
    fieldConfidence: {
      vendor: 0.99,
      transactionDate: 0.98,
      totalAmount: 0.99,
      currency: 0.99,
      category: 0.97,
    },
    reviewReason: null,
    createdAt: '2026-08-14T10:00:00.000Z',
    updatedAt: '2026-08-14T10:00:00.000Z',
  },
  {
    id: 'tx-002',
    vendor: 'Meta Platforms Ireland Ltd',
    transactionDate: '2026-08-12',
    invoiceNumber: 'INV-2391',
    subtotal: 42372,
    taxAmount: 7627,
    totalAmount: 49999,
    currency: 'INR',
    category: 'Marketing & Advertising',
    shortDescription: 'Facebook & Instagram customer acquisition campaign',
    status: 'Verified',
    confidence: 0.97,
    fieldConfidence: {
      vendor: 0.98,
      transactionDate: 0.96,
      totalAmount: 0.99,
      currency: 0.99,
      category: 0.94,
    },
    reviewReason: null,
    createdAt: '2026-08-12T14:30:00.000Z',
    updatedAt: '2026-08-12T14:30:00.000Z',
  },
  {
    id: 'tx-003',
    vendor: 'Kraft Packaging Solutions Pvt Ltd',
    transactionDate: '2026-08-10',
    invoiceNumber: 'KP-2026-904',
    subtotal: 27542.37,
    taxAmount: 4957.63,
    totalAmount: 32500,
    currency: 'INR',
    category: 'Inventory & Raw Materials',
    shortDescription: '5,000 custom printed corrugated mailer boxes & tape',
    status: 'Verified',
    confidence: 0.96,
    fieldConfidence: {
      vendor: 0.97,
      transactionDate: 0.95,
      totalAmount: 0.98,
      currency: 0.99,
      category: 0.93,
    },
    reviewReason: null,
    createdAt: '2026-08-10T09:15:00.000Z',
    updatedAt: '2026-08-10T09:15:00.000Z',
  },
  {
    id: 'tx-004',
    vendor: 'Office Space Tech & Ergonomics',
    transactionDate: '2026-08-11',
    invoiceNumber: 'OFF-EQ-992',
    subtotal: 21185.59,
    taxAmount: 3813.41,
    totalAmount: 24999,
    currency: 'INR',
    category: 'Equipment & Hardware',
    shortDescription: '2x Ergonomic high-back mesh workstations chairs',
    status: 'Needs Review',
    confidence: 0.78,
    fieldConfidence: {
      vendor: 0.75,
      transactionDate: 0.80,
      totalAmount: 0.88,
      currency: 0.95,
      category: 0.85,
    },
    reviewReason: 'Scanned from OCR receipt with informal admin note; verify invoice header',
    createdAt: '2026-08-11T16:45:00.000Z',
    updatedAt: '2026-08-11T16:45:00.000Z',
  },
  {
    id: 'tx-005',
    vendor: 'Delhivery Logistics Ltd',
    transactionDate: '2026-08-08',
    invoiceNumber: 'DEL-EXP-88412',
    subtotal: 15634,
    taxAmount: 2816,
    totalAmount: 18450,
    currency: 'INR',
    category: 'Logistics & Shipping',
    shortDescription: 'B2C surface forward freight charges for 1,240 deliveries',
    status: 'Verified',
    confidence: 0.95,
    fieldConfidence: {
      vendor: 0.96,
      transactionDate: 0.95,
      totalAmount: 0.97,
      currency: 0.98,
      category: 0.92,
    },
    reviewReason: null,
    createdAt: '2026-08-08T11:20:00.000Z',
    updatedAt: '2026-08-08T11:20:00.000Z',
  },
  {
    id: 'tx-006',
    vendor: 'Sharma & Associates CA Firm',
    transactionDate: '2026-08-06',
    invoiceNumber: 'SA-AUDIT-2026-44',
    subtotal: 12711.86,
    taxAmount: 2288.14,
    totalAmount: 15000,
    currency: 'INR',
    category: 'Professional Services',
    shortDescription: 'Monthly GST return filing, TDS reconciliation & compliance retainer',
    status: 'Verified',
    confidence: 0.94,
    fieldConfidence: {
      vendor: 0.95,
      transactionDate: 0.94,
      totalAmount: 0.96,
      currency: 0.98,
      category: 0.90,
    },
    reviewReason: null,
    createdAt: '2026-08-06T15:10:00.000Z',
    updatedAt: '2026-08-06T15:10:00.000Z',
  },
  {
    id: 'tx-007',
    vendor: 'Amazon Web Services (AWS)',
    transactionDate: '2026-08-05',
    invoiceNumber: 'AWS-981240182',
    subtotal: 7559.32,
    taxAmount: 1360.68,
    totalAmount: 8920,
    currency: 'INR',
    category: 'Software & SaaS',
    shortDescription: 'AWS cloud infrastructure hosting (EC2, S3, RDS, CloudFront)',
    status: 'Verified',
    confidence: 0.97,
    fieldConfidence: {
      vendor: 0.99,
      transactionDate: 0.97,
      totalAmount: 0.98,
      currency: 0.98,
      category: 0.95,
    },
    reviewReason: null,
    createdAt: '2026-08-05T08:00:00.000Z',
    updatedAt: '2026-08-05T08:00:00.000Z',
  },
  {
    id: 'tx-008',
    vendor: 'Shopify Commerce Inc',
    transactionDate: '2026-08-02',
    invoiceNumber: 'SHOPIFY-INV-10928',
    subtotal: 2117.80,
    taxAmount: 381.20,
    totalAmount: 2499,
    currency: 'INR',
    category: 'Software & SaaS',
    shortDescription: 'Shopify Advanced monthly e-commerce store plan subscription',
    status: 'Verified',
    confidence: 0.98,
    fieldConfidence: {
      vendor: 0.99,
      transactionDate: 0.98,
      totalAmount: 0.99,
      currency: 0.99,
      category: 0.96,
    },
    reviewReason: null,
    createdAt: '2026-08-02T12:00:00.000Z',
    updatedAt: '2026-08-02T12:00:00.000Z',
  },
];

export function getStoredTransactions(): LedgerTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TRANSACTIONS));
      return INITIAL_SAMPLE_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_TRANSACTIONS;
  } catch {
    return INITIAL_SAMPLE_TRANSACTIONS;
  }
}

export function saveTransactionToStorage(tx: LedgerTransaction): LedgerTransaction[] {
  const current = getStoredTransactions();
  const index = current.findIndex(t => t.id === tx.id);
  let updated: LedgerTransaction[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...tx, updatedAt: new Date().toISOString() };
  } else {
    updated = [tx, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save transaction to localStorage', e);
  }
  return updated;
}

export function deleteTransactionFromStorage(id: string): LedgerTransaction[] {
  const current = getStoredTransactions();
  const updated = current.filter(t => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete transaction from localStorage', e);
  }
  return updated;
}

export function resetLedgerStorage(): LedgerTransaction[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TRANSACTIONS));
  } catch (e) {
    console.error('Failed to reset localStorage', e);
  }
  return INITIAL_SAMPLE_TRANSACTIONS;
}

export function clearLedgerStorage(): LedgerTransaction[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
  return [];
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDashboardMetrics(transactions: LedgerTransaction[]): DashboardMetrics {
  const transactionCount = transactions.length;
  if (transactionCount === 0) {
    return {
      totalSpendINR: 0,
      totalSpendFormatted: '₹0',
      transactionCount: 0,
      vendorCount: 0,
      needsReviewCount: 0,
      verifiedCount: 0,
      averageConfidence: 0,
      categoryBreakdown: [],
      largestVendor: null,
    };
  }

  let totalSpend = 0;
  let needsReviewCount = 0;
  let verifiedCount = 0;
  let confidenceSum = 0;
  const vendorSpendMap: Record<string, number> = {};
  const categorySpendMap: Record<ExpenseCategory, { amount: number; count: number }> = {} as any;

  transactions.forEach(t => {
    totalSpend += t.totalAmount;
    confidenceSum += t.confidence || 0.9;
    if (t.status === 'Needs Review') {
      needsReviewCount++;
    } else {
      verifiedCount++;
    }

    // Vendor spend
    const cleanVendor = t.vendor.trim();
    vendorSpendMap[cleanVendor] = (vendorSpendMap[cleanVendor] || 0) + t.totalAmount;

    // Category spend
    const cat = t.category;
    if (!categorySpendMap[cat]) {
      categorySpendMap[cat] = { amount: 0, count: 0 };
    }
    categorySpendMap[cat].amount += t.totalAmount;
    categorySpendMap[cat].count += 1;
  });

  const uniqueVendors = Object.keys(vendorSpendMap);
  const vendorCount = uniqueVendors.length;

  // Find largest vendor
  let largestVendor: { vendor: string; amount: number } | null = null;
  let maxVendorSpend = 0;
  uniqueVendors.forEach(v => {
    if (vendorSpendMap[v] > maxVendorSpend) {
      maxVendorSpend = vendorSpendMap[v];
      largestVendor = { vendor: v, amount: maxVendorSpend };
    }
  });

  // Calculate category stats sorted by spend descending
  const categoryBreakdown: CategoryStat[] = Object.entries(categorySpendMap)
    .map(([cat, data]) => ({
      category: cat as ExpenseCategory,
      amount: data.amount,
      percentage: totalSpend > 0 ? Math.round((data.amount / totalSpend) * 100) : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalSpendINR: totalSpend,
    totalSpendFormatted: formatINR(totalSpend),
    transactionCount,
    vendorCount,
    needsReviewCount,
    verifiedCount,
    averageConfidence: Math.round((confidenceSum / transactionCount) * 100),
    categoryBreakdown,
    largestVendor,
  };
}

export function exportTransactionsToCSV(transactions: LedgerTransaction[]): string {
  const headers = [
    'Transaction ID',
    'Date',
    'Vendor',
    'Category',
    'Invoice Number',
    'Description',
    'Subtotal',
    'Tax',
    'Total Amount',
    'Currency',
    'Status',
    'Confidence (%)',
    'Review Reason',
    'Created At',
  ];

  const rows = transactions.map(t => [
    t.id,
    t.transactionDate,
    `"${(t.vendor || '').replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${(t.invoiceNumber || '').replace(/"/g, '""')}"`,
    `"${(t.shortDescription || '').replace(/"/g, '""')}"`,
    t.subtotal ?? '',
    t.taxAmount ?? '',
    t.totalAmount,
    t.currency,
    t.status,
    Math.round(t.confidence * 100),
    `"${(t.reviewReason || '').replace(/"/g, '""')}"`,
    t.createdAt,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportTransactionsToJSON(transactions: LedgerTransaction[]): string {
  return JSON.stringify(transactions, null, 2);
}
