import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Sparkles,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Tag,
  Save,
  Check,
  Info,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  CANONICAL_CATEGORIES,
  ExpenseCategory,
  LedgerTransaction,
  ParsedInvoiceData,
} from '../types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface ReviewPanelProps {
  parsedData: ParsedInvoiceData;
  onSave: (transaction: LedgerTransaction) => void;
  onCancel: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  parsedData,
  onSave,
  onCancel,
}) => {
  // Local editable form state
  const [vendor, setVendor] = useState(parsedData.vendor || '');
  const [transactionDate, setTransactionDate] = useState(parsedData.transactionDate || '');
  const [invoiceNumber, setInvoiceNumber] = useState(parsedData.invoiceNumber || '');
  const [category, setCategory] = useState<ExpenseCategory>(parsedData.category);
  const [subtotal, setSubtotal] = useState<string>(
    parsedData.subtotal !== null ? String(parsedData.subtotal) : ''
  );
  const [taxAmount, setTaxAmount] = useState<string>(
    parsedData.taxAmount !== null ? String(parsedData.taxAmount) : ''
  );
  const [totalAmount, setTotalAmount] = useState<string>(
    parsedData.totalAmount !== null ? String(parsedData.totalAmount) : ''
  );
  const [currency, setCurrency] = useState(parsedData.currency || 'INR');
  const [shortDescription, setShortDescription] = useState(parsedData.shortDescription || '');
  const [showRawText, setShowRawText] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Status override (User can force verified if they reviewed it)
  const [manualStatusOverride, setManualStatusOverride] = useState<'Verified' | 'Needs Review' | null>(null);

  // Math Check calculations
  const parsedSub = parseFloat(subtotal) || 0;
  const parsedTax = parseFloat(taxAmount) || 0;
  const parsedTot = parseFloat(totalAmount) || 0;
  const hasSubAndTax = subtotal.trim() !== '' && taxAmount.trim() !== '';
  const calculatedSum = parsedSub + parsedTax;
  const mathDiscrepancy = hasSubAndTax ? Math.abs(calculatedSum - parsedTot) : 0;
  const isMathValid = !hasSubAndTax || mathDiscrepancy <= 1.0;

  // Determine effective status
  const effectiveStatus: 'Verified' | 'Needs Review' =
    manualStatusOverride ??
    (parsedData.needsReview || !isMathValid || parsedTot <= 0 || !vendor || !transactionDate
      ? 'Needs Review'
      : 'Verified');

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(parsedData.rawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = parseFloat(totalAmount) || 0;
    const finalSub = subtotal.trim() !== '' ? parseFloat(subtotal) : null;
    const finalTax = taxAmount.trim() !== '' ? parseFloat(taxAmount) : null;

    const newTransaction: LedgerTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      vendor: vendor.trim() || 'Unspecified Vendor',
      transactionDate: transactionDate.trim() || new Date().toISOString().split('T')[0],
      invoiceNumber: invoiceNumber.trim() || null,
      subtotal: finalSub,
      taxAmount: finalTax,
      totalAmount: finalAmount,
      currency: currency.toUpperCase().trim() || 'INR',
      category: category,
      shortDescription: shortDescription.trim() || `Expense for ${vendor}`,
      status: effectiveStatus,
      confidence: parsedData.confidence,
      fieldConfidence: parsedData.fieldConfidence,
      reviewReason: effectiveStatus === 'Needs Review' ? parsedData.reviewReason || 'Manual review required' : null,
      rawText: parsedData.rawText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newTransaction);
  };

  return (
    <div id="review-panel-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner: AI Extraction Summary */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#5A5A40]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Review & Validate AI Extraction</h2>
                <span className="text-xs bg-stone-100 text-[#706B63] px-2.5 py-0.5 rounded-full font-mono">
                  Human-in-the-Loop
                </span>
              </div>
              <p className="text-sm text-[#706B63]">
                Verify AI-extracted values. Neha, you can edit any field before committing to the ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-[#8C877D] font-medium">Overall AI Score</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <ConfidenceBadge score={parsedData.confidence} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate Warning Callout */}
        {parsedData.duplicateWarning?.isDuplicate && (
          <div
            id="duplicate-warning-banner"
            className="mt-4 p-4 rounded-xl bg-orange-50/80 border border-orange-200 text-[#92400E] flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-sm flex-1">
              <div className="font-semibold text-[#78350F] flex items-center gap-2">
                Possible Duplicate Invoice Detected
                <span className="text-xs bg-orange-200/70 text-[#78350F] px-2 py-0.5 rounded-full">
                  {parsedData.duplicateWarning.type === 'EXACT_INVOICE'
                    ? 'Matching Invoice #'
                    : 'Matching Vendor + Amount'}
                </span>
              </div>
              <p className="mt-1 text-[#92400E] leading-relaxed">{parsedData.duplicateWarning.reason}</p>
              <div className="mt-2 text-xs text-[#B45309] font-medium">
                You can still proceed and save if this is a valid recurring expense or separate line item.
              </div>
            </div>
          </div>
        )}

        {/* Needs Review Diagnostic Callout */}
        {parsedData.needsReview && !parsedData.duplicateWarning?.isDuplicate && (
          <div
            id="needs-review-banner"
            className="mt-4 p-4 rounded-xl bg-orange-50/80 border border-orange-200 text-[#92400E] flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-[#78350F]">⚠ Transaction Flagged: Needs Review</div>
              <p className="mt-1 text-[#92400E]">
                {parsedData.reviewReason ||
                  'One or more fields have lower extraction confidence or mathematical variance. Please verify before saving.'}
              </p>
            </div>
          </div>
        )}

        {/* Category Reasoning Highlight */}
        {parsedData.categoryReason && (
          <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-[#706B63] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#5A5A40] shrink-0" />
            <span>
              <strong className="text-[#1A1A1A]">AI Classification Reason:</strong> {parsedData.categoryReason}
            </span>
          </div>
        )}
      </div>

      {/* Main Editable Form */}
      <form onSubmit={handleSaveTransaction} className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vendor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-vendor" className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#706B63]" />
                Vendor / Merchant Name <span className="text-[#D97706]">*</span>
              </label>
              <ConfidenceBadge score={parsedData.fieldConfidence.vendor} size="sm" showLabel={false} />
            </div>
            <input
              id="input-vendor"
              type="text"
              required
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              placeholder="e.g. Meta Platforms Ireland Ltd"
              className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-date" className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#706B63]" />
                Transaction / Invoice Date <span className="text-[#D97706]">*</span>
              </label>
              <ConfidenceBadge score={parsedData.fieldConfidence.transactionDate} size="sm" showLabel={false} />
            </div>
            <input
              id="input-date"
              type="date"
              required
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all font-mono"
            />
          </div>

          {/* Invoice Number */}
          <div className="space-y-1.5">
            <label htmlFor="input-invoice-number" className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#706B63]" />
              Invoice / Receipt # <span className="text-[#8C877D] font-normal">(optional)</span>
            </label>
            <input
              id="input-invoice-number"
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2391"
              className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all font-mono"
            />
          </div>

          {/* Expense Category */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-category" className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#706B63]" />
                Expense Category <span className="text-[#D97706]">*</span>
              </label>
              <ConfidenceBadge score={parsedData.fieldConfidence.category} size="sm" showLabel={false} />
            </div>
            <select
              id="select-category"
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all font-medium text-[#1A1A1A]"
            >
              {CANONICAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Breakdown (Subtotal, Tax, Total) */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#706B63] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#5A5A40]" />
              Financial Amounts & Currency
            </span>
            <div className="flex items-center gap-2">
              <ConfidenceBadge score={parsedData.fieldConfidence.totalAmount} size="sm" showLabel={false} />
              {hasSubAndTax && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    isMathValid ? 'bg-stone-200/80 text-[#5A5A40]' : 'bg-orange-100 text-[#92400E]'
                  }`}
                >
                  {isMathValid ? '✓ Math Reconciled' : '⚠ Subtotal + Tax Mismatch'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Currency */}
            <div>
              <label htmlFor="input-currency" className="block text-xs text-[#706B63] font-medium mb-1">
                Currency
              </label>
              <input
                id="input-currency"
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                placeholder="INR"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 font-mono uppercase"
              />
            </div>

            {/* Subtotal */}
            <div>
              <label htmlFor="input-subtotal" className="block text-xs text-[#706B63] font-medium mb-1">
                Subtotal (pre-tax)
              </label>
              <input
                id="input-subtotal"
                type="number"
                step="any"
                value={subtotal}
                onChange={e => setSubtotal(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 font-mono"
              />
            </div>

            {/* Tax */}
            <div>
              <label htmlFor="input-tax" className="block text-xs text-[#706B63] font-medium mb-1">
                Tax (GST / VAT)
              </label>
              <input
                id="input-tax"
                type="number"
                step="any"
                value={taxAmount}
                onChange={e => setTaxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 font-mono"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label htmlFor="input-total-amount" className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Total Amount Due <span className="text-[#D97706]">*</span>
              </label>
              <input
                id="input-total-amount"
                type="number"
                step="any"
                required
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-semibold bg-white border-2 border-[#5A5A40]/50 rounded-xl focus:ring-2 focus:ring-[#5A5A40] font-mono text-[#1A1A1A]"
              />
            </div>
          </div>

          {!isMathValid && (
            <p className="text-xs text-[#92400E] bg-orange-50 p-3 rounded-xl border border-orange-200">
              Note: Subtotal ({subtotal}) + Tax ({taxAmount}) = {calculatedSum}, which differs from Total ({totalAmount}) by {mathDiscrepancy.toFixed(2)}. Please verify if discounts or other charges apply.
            </p>
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <label htmlFor="input-description" className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#706B63]" />
            Bookkeeping Note / Description
          </label>
          <input
            id="input-description"
            type="text"
            value={shortDescription}
            onChange={e => setShortDescription(e.target.value)}
            placeholder="e.g. Facebook advertising campaign for summer glow sale"
            className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30"
          />
        </div>

        {/* Optional Line Items Table (if any extracted) */}
        {parsedData.lineItems && parsedData.lineItems.length > 0 && (
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
              Extracted Line Items ({parsedData.lineItems.length})
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50/50 text-[#706B63] border-b border-stone-100">
                <tr>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium text-right">Qty</th>
                  <th className="px-4 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {parsedData.lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="px-4 py-2.5 text-[#1A1A1A]">{item.description}</td>
                    <td className="px-4 py-2.5 text-[#706B63] text-right">{item.quantity ?? '-'}</td>
                    <td className="px-4 py-2.5 font-mono text-[#1A1A1A] text-right">
                      {item.amount ? `${currency} ${item.amount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Raw Text Toggle Accordion */}
        <div className="pt-2">
          <button
            id="toggle-raw-text-btn"
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="text-xs text-[#5A5A40] hover:text-[#484833] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            {showRawText ? 'Hide original invoice raw text' : 'Inspect original raw receipt / invoice text'}
          </button>

          {showRawText && (
            <div className="mt-2 relative">
              <button
                type="button"
                onClick={handleCopyRaw}
                className="absolute top-2.5 right-2.5 text-xs bg-stone-800 hover:bg-stone-700 text-white px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer"
              >
                {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedRaw ? 'Copied' : 'Copy'}
              </button>
              <pre className="p-4 bg-stone-900 text-stone-100 text-xs font-mono rounded-xl overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                {parsedData.rawText}
              </pre>
            </div>
          )}
        </div>

        {/* Verification Status Selector & Submission Actions */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-[#706B63] font-medium">Save as:</span>
            <div className="inline-flex rounded-full border border-stone-200 p-0.5 bg-stone-100">
              <button
                type="button"
                onClick={() => setManualStatusOverride('Verified')}
                className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  effectiveStatus === 'Verified'
                    ? 'bg-white text-[#5A5A40] shadow-xs border border-stone-200 font-bold'
                    : 'text-[#706B63] hover:text-[#1A1A1A]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                Verified
              </button>
              <button
                type="button"
                onClick={() => setManualStatusOverride('Needs Review')}
                className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  effectiveStatus === 'Needs Review'
                    ? 'bg-white text-[#B45309] shadow-xs border border-stone-200 font-bold'
                    : 'text-[#706B63] hover:text-[#1A1A1A]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                Needs Review
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="cancel-review-btn"
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[#706B63] hover:text-[#1A1A1A] bg-white border border-stone-300 rounded-full hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-to-ledger-btn"
              type="submit"
              className={`px-6 py-2 text-sm font-semibold text-white rounded-full shadow-2xs transition-all flex items-center gap-2 cursor-pointer ${
                effectiveStatus === 'Verified'
                  ? 'bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3C3C2B]'
                  : 'bg-[#D97706] hover:bg-[#B45309] active:bg-[#92400E]'
              }`}
            >
              <Save className="w-4 h-4" />
              Save to Ledger
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
