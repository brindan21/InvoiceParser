import { DuplicateDetectionResult, LedgerTransaction, ParsedInvoiceData } from '../../types';

/**
 * Checks parsed invoice against existing ledger transactions for duplicates.
 * Returns clear diagnostic warnings without automatically deleting or altering data.
 */
export function checkDuplicateInvoice(
  candidate: Partial<ParsedInvoiceData>,
  existingTransactions: LedgerTransaction[]
): DuplicateDetectionResult {
  if (!existingTransactions || existingTransactions.length === 0) {
    return { isDuplicate: false };
  }

  const cleanInvoiceNo = candidate.invoiceNumber?.trim().toLowerCase();
  const cleanVendor = candidate.vendor?.trim().toLowerCase();
  const candidateAmount = candidate.totalAmount;
  const candidateDate = candidate.transactionDate?.trim();

  // Rule 1: Exact Invoice Number match (highest confidence signal)
  if (cleanInvoiceNo && cleanInvoiceNo.length > 2) {
    const exactInvoiceMatch = existingTransactions.find(t => 
      t.invoiceNumber && t.invoiceNumber.trim().toLowerCase() === cleanInvoiceNo
    );

    if (exactInvoiceMatch) {
      return {
        isDuplicate: true,
        type: 'EXACT_INVOICE',
        matchedId: exactInvoiceMatch.id,
        matchedVendor: exactInvoiceMatch.vendor,
        matchedAmount: exactInvoiceMatch.totalAmount,
        matchedDate: exactInvoiceMatch.transactionDate,
        reason: `Duplicate invoice number "${candidate.invoiceNumber}" already exists in ledger (saved for ${exactInvoiceMatch.vendor} on ${exactInvoiceMatch.transactionDate} for ${exactInvoiceMatch.currency} ${exactInvoiceMatch.totalAmount.toLocaleString()}).`,
      };
    }
  }

  // Rule 2: Same Vendor + Same Amount + Same Date
  if (cleanVendor && candidateAmount && candidateDate) {
    const exactTransactionMatch = existingTransactions.find(t => {
      const vMatch = t.vendor.trim().toLowerCase() === cleanVendor ||
        t.vendor.trim().toLowerCase().includes(cleanVendor) ||
        cleanVendor.includes(t.vendor.trim().toLowerCase());
      const aMatch = Math.abs(t.totalAmount - candidateAmount) < 0.01;
      const dMatch = t.transactionDate === candidateDate;
      return vMatch && aMatch && dMatch;
    });

    if (exactTransactionMatch) {
      return {
        isDuplicate: true,
        type: 'VENDOR_AMOUNT_DATE',
        matchedId: exactTransactionMatch.id,
        matchedVendor: exactTransactionMatch.vendor,
        matchedAmount: exactTransactionMatch.totalAmount,
        matchedDate: exactTransactionMatch.transactionDate,
        reason: `Potential duplicate: Same vendor (${exactTransactionMatch.vendor}), date (${candidateDate}), and amount (${exactTransactionMatch.currency} ${candidateAmount.toLocaleString()}) matches existing ledger entry #${exactTransactionMatch.id.slice(0, 6)}.`,
      };
    }
  }

  // Rule 3: Fuzzy match - same vendor and same amount within +/- 3 days
  if (cleanVendor && candidateAmount && candidateDate) {
    const candidateTimestamp = new Date(candidateDate).getTime();
    if (!isNaN(candidateTimestamp)) {
      const nearMatch = existingTransactions.find(t => {
        const vMatch = t.vendor.trim().toLowerCase() === cleanVendor;
        const aMatch = Math.abs(t.totalAmount - candidateAmount) < 0.01;
        const tDate = new Date(t.transactionDate).getTime();
        if (isNaN(tDate)) return false;
        const dayDiff = Math.abs(candidateTimestamp - tDate) / (1000 * 60 * 60 * 24);
        return vMatch && aMatch && dayDiff <= 3;
      });

      if (nearMatch) {
        return {
          isDuplicate: true,
          type: 'SIMILAR',
          matchedId: nearMatch.id,
          matchedVendor: nearMatch.vendor,
          matchedAmount: nearMatch.totalAmount,
          matchedDate: nearMatch.transactionDate,
          reason: `Similar transaction detected: ${nearMatch.vendor} on ${nearMatch.transactionDate} for ${nearMatch.currency} ${candidateAmount.toLocaleString()} (within 3 days). Please verify if this is a repeat bill or duplicate receipt.`,
        };
      }
    }
  }

  return { isDuplicate: false };
}
