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
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Equal,
  Plus,
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
  const isMathValid = !hasSubAndTax || mathDiscrepancy <= 1.5;

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
    <div id="review-panel-container" className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: AI Extraction Summary */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">Review & Validate AI Extraction</h2>
                <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
                  Human-in-the-Loop
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Verify AI-extracted values before committing to your official company ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-stone-400">Overall AI Score</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <ConfidenceBadge score={parsedData.confidence} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Warning Callouts if Duplicate or Anomaly detected */}
        {parsedData.possibleDuplicate && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Duplicate Notice:</span>
              <p>{parsedData.reviewReason || 'Matching invoice number or vendor amount already exists in ledger.'}</p>
            </div>
          </div>
        )}

        {/* Math Mismatch Callout */}
        {!isMathValid && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Mathematical Discrepancy Detected:</span>
              <p>
                Subtotal ({subtotal}) + Tax ({taxAmount}) = {calculatedSum.toFixed(2)}, which does not match Total ({totalAmount}). Please adjust the values.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Review Section */}
      <form onSubmit={handleSaveTransaction} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Structured Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">Extracted Voucher Details</h3>
            <span className="text-xs text-stone-400 font-medium">Editable Fields</span>
          </div>

          <div className="space-y-4">
            {/* Vendor Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Vendor / Merchant Name</span>
                </label>
                {parsedData.fieldConfidence?.vendor !== undefined && (
                  <ConfidenceBadge score={parsedData.fieldConfidence.vendor} size="sm" showLabel={false} />
                )}
              </div>
              <input
                id="edit-vendor-input"
                type="text"
                required
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="e.g., Meta Platforms Ireland, AWS, Delhivery"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Date & Invoice Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>Transaction Date</span>
                  </label>
                  {parsedData.fieldConfidence?.transactionDate !== undefined && (
                    <ConfidenceBadge score={parsedData.fieldConfidence.transactionDate} size="sm" showLabel={false} />
                  )}
                </div>
                <input
                  id="edit-date-input"
                  type="date"
                  required
                  value={transactionDate}
                  onChange={e => setTransactionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>Invoice / Receipt #</span>
                  </label>
                  {parsedData.fieldConfidence?.invoiceNumber !== undefined && (
                    <ConfidenceBadge score={parsedData.fieldConfidence.invoiceNumber} size="sm" showLabel={false} />
                  )}
                </div>
                <input
                  id="edit-invoice-number-input"
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  placeholder="e.g., INV-2391, AWS-889104"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-stone-500" />
                  <span>Expense Category</span>
                </label>
                {parsedData.fieldConfidence?.category !== undefined && (
                  <ConfidenceBadge score={parsedData.fieldConfidence.category} size="sm" showLabel={false} />
                )}
              </div>
              <select
                id="edit-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                {CANONICAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amounts & Currency Grid */}
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Financial Breakdown</span>
                <span className="text-[11px] font-mono text-stone-500 font-semibold">
                  Currency: {currency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Subtotal */}
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Subtotal (Net)</label>
                  <input
                    id="edit-subtotal-input"
                    type="number"
                    step="any"
                    value={subtotal}
                    onChange={e => setSubtotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                {/* Tax */}
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Tax / GST</label>
                  <input
                    id="edit-tax-input"
                    type="number"
                    step="any"
                    value={taxAmount}
                    onChange={e => setTaxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                {/* Total */}
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Total Payable</label>
                  <input
                    id="edit-total-input"
                    type="number"
                    step="any"
                    required
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Real-time Math Equation Bar */}
              {hasSubAndTax && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between font-mono ${
                  isMathValid
                    ? 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{parsedSub.toFixed(2)}</span>
                    <Plus className="w-3 h-3 text-stone-400" />
                    <span>{parsedTax.toFixed(2)}</span>
                    <Equal className="w-3 h-3 text-stone-400" />
                    <span>{calculatedSum.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-[11px]">
                    {isMathValid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Math Validated</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Mismatch Δ {mathDiscrepancy.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Short Description / Accounting Memo</label>
              <input
                id="edit-description-input"
                type="text"
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="e.g., Facebook advertising campaign for summer sale"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Source Document & Line Items (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Decision Box */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Ledger Verification Status</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  effectiveStatus === 'Verified'
                    ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-900 border border-amber-500/25'
                }`}
              >
                {effectiveStatus === 'Verified' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{effectiveStatus}</span>
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {effectiveStatus === 'Verified'
                ? 'All critical fields extracted with high confidence and math checks passed.'
                : 'Flagged for human sign-off due to lower confidence or missing fields.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setManualStatusOverride('Verified')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  effectiveStatus === 'Verified'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Mark Verified
              </button>
              <button
                type="button"
                onClick={() => setManualStatusOverride('Needs Review')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  effectiveStatus === 'Needs Review'
                    ? 'bg-amber-500/20 text-amber-900 border-amber-400'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Flag Review
              </button>
            </div>
          </div>

          {/* Line Items Table if present */}
          {parsedData.lineItems && parsedData.lineItems.length > 0 && (
            <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900">Extracted Line Items</span>
                <span className="text-[11px] font-mono text-stone-400 font-semibold">
                  {parsedData.lineItems.length} items
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedData.lineItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span className="truncate pr-2">{item.description}</span>
                      <span className="font-mono shrink-0">
                        {currency} {item.amount.toLocaleString()}
                      </span>
                    </div>
                    {item.quantity && (
                      <div className="text-[11px] text-stone-500 font-mono">
                        Qty: {item.quantity} {item.unitPrice ? `@ ${currency} ${item.unitPrice}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Source Text Box */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900">Source Document Text</span>
              <button
                type="button"
                onClick={handleCopyRaw}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedRaw ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-stone-600 bg-stone-50 p-3 rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-stone-200/60">
              {parsedData.rawText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors cursor-pointer text-center"
            >
              Cancel / Back
            </button>

            <button
              id="confirm-save-ledger-btn"
              type="submit"
              className="flex-2 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-stone-950" />
              <span>Commit to Ledger</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
