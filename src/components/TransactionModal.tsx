import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Copy,
  Check,
  Save,
} from 'lucide-react';
import {
  CANONICAL_CATEGORIES,
  ExpenseCategory,
  LedgerTransaction,
} from '../types';
import { formatINR } from '../services/ledger/ledgerStorage';
import { ConfidenceBadge } from './ConfidenceBadge';

interface TransactionModalProps {
  transaction: LedgerTransaction | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSave: (updated: LedgerTransaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  mode: initialMode,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!transaction) return null;

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [vendor, setVendor] = useState(transaction.vendor);
  const [transactionDate, setTransactionDate] = useState(transaction.transactionDate);
  const [invoiceNumber, setInvoiceNumber] = useState(transaction.invoiceNumber || '');
  const [category, setCategory] = useState<ExpenseCategory>(transaction.category);
  const [subtotal, setSubtotal] = useState(
    transaction.subtotal !== null ? String(transaction.subtotal) : ''
  );
  const [taxAmount, setTaxAmount] = useState(
    transaction.taxAmount !== null ? String(transaction.taxAmount) : ''
  );
  const [totalAmount, setTotalAmount] = useState(String(transaction.totalAmount));
  const [currency, setCurrency] = useState(transaction.currency || 'INR');
  const [shortDescription, setShortDescription] = useState(transaction.shortDescription);
  const [status, setStatus] = useState<'Verified' | 'Needs Review'>(transaction.status);
  const [showRaw, setShowRaw] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handleCopyRaw = () => {
    if (transaction.rawText) {
      navigator.clipboard.writeText(transaction.rawText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LedgerTransaction = {
      ...transaction,
      vendor: vendor.trim() || 'Unspecified Vendor',
      transactionDate: transactionDate.trim() || transaction.transactionDate,
      invoiceNumber: invoiceNumber.trim() || null,
      category,
      subtotal: subtotal.trim() !== '' ? parseFloat(subtotal) : null,
      taxAmount: taxAmount.trim() !== '' ? parseFloat(taxAmount) : null,
      totalAmount: parseFloat(totalAmount) || transaction.totalAmount,
      currency: currency.toUpperCase().trim() || 'INR',
      shortDescription: shortDescription.trim() || transaction.shortDescription,
      status,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        id="transaction-detail-modal"
        className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#F4F3EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#5A5A40]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  {mode === 'edit' ? 'Edit Ledger Entry' : 'Transaction Details'}
                </h3>
                <span className="text-xs font-mono bg-stone-200/80 text-[#5A5A40] px-2.5 py-0.5 rounded-full font-medium">
                  {transaction.id}
                </span>
              </div>
              <p className="text-xs text-[#706B63]">Booked: {new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'view' && (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-3.5 py-1 text-xs font-semibold text-[#5A5A40] bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8C877D] hover:text-[#1A1A1A] hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Top Status & Confidence Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#706B63] font-medium">Status:</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status === 'Verified'
                    ? 'bg-stone-100 text-[#5A5A40] border border-stone-300'
                    : 'bg-orange-50 text-[#92400E] border border-orange-200'
                }`}
              >
                {status === 'Verified' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                )}
                {status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#706B63] font-medium">AI Confidence:</span>
              <ConfidenceBadge score={transaction.confidence} size="sm" />
            </div>
          </div>

          {transaction.reviewReason && (
            <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-[#92400E] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#78350F]">Review Flag: </span>
                {transaction.reviewReason}
              </div>
            </div>
          )}

          {mode === 'view' ? (
            /* View Mode */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[#8C877D] font-medium">Vendor</span>
                  <div className="text-sm font-semibold text-[#1A1A1A]">{transaction.vendor}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[#8C877D] font-medium">Transaction Date</span>
                  <div className="text-sm font-semibold font-mono text-[#1A1A1A]">{transaction.transactionDate}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[#8C877D] font-medium">Category</span>
                  <div className="text-sm font-semibold text-[#1A1A1A]">{transaction.category}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[#8C877D] font-medium">Invoice #</span>
                  <div className="text-sm font-semibold font-mono text-[#1A1A1A]">
                    {transaction.invoiceNumber || 'None'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F3EE] border border-stone-200/90 space-y-2">
                <span className="text-[#706B63] font-medium">Financial Summary</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[11px] text-[#8C877D]">Subtotal:</span>
                    <div className="font-mono font-medium text-[#2C2926]">
                      {transaction.subtotal !== null ? `${transaction.currency} ${transaction.subtotal.toLocaleString()}` : '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C877D]">Tax Amount:</span>
                    <div className="font-mono font-medium text-[#2C2926]">
                      {transaction.taxAmount !== null ? `${transaction.currency} ${transaction.taxAmount.toLocaleString()}` : '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C877D] font-semibold">Total Amount:</span>
                    <div className="font-mono font-bold text-[#1A1A1A] text-sm">
                      {transaction.currency === 'INR' ? formatINR(transaction.totalAmount) : `${transaction.currency} ${transaction.totalAmount.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="text-[#8C877D] font-medium">Description</span>
                <div className="text-[#2C2926] leading-relaxed">{transaction.shortDescription}</div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form id="edit-transaction-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1A1A1A] font-semibold mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1A1A] font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={e => setTransactionDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1A1A] font-semibold mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1A1A] font-semibold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                  >
                    {CANONICAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#1A1A1A] font-semibold mb-1">Total Amount *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1A1A] font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Needs Review">Needs Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Description / Note</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-[#F9F8F6] text-xs focus:bg-white focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
                />
              </div>
            </form>
          )}

          {/* Raw Text Accordion */}
          {transaction.rawText && (
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs text-[#5A5A40] hover:text-[#484833] font-medium flex items-center gap-1 cursor-pointer"
              >
                {showRaw ? 'Hide raw document text' : 'View original parsed document text'}
              </button>

              {showRaw && (
                <div className="mt-2 relative">
                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="absolute top-2 right-2 text-xs bg-stone-800 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                  >
                    {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedRaw ? 'Copied' : 'Copy'}
                  </button>
                  <pre className="p-4 bg-stone-900 text-stone-200 text-xs font-mono rounded-xl overflow-x-auto max-h-40 whitespace-pre-wrap">
                    {transaction.rawText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#F4F3EE] flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(transaction.id);
                  onClose();
                }}
                className="text-xs font-semibold text-red-700 hover:text-red-800 px-3.5 py-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
              >
                Delete Entry
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#706B63] bg-white border border-stone-300 hover:bg-stone-50 rounded-full transition-colors cursor-pointer"
            >
              {mode === 'edit' ? 'Cancel' : 'Close'}
            </button>

            {mode === 'edit' && (
              <button
                type="submit"
                form="edit-transaction-form"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
