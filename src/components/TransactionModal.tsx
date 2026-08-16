import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Copy,
  Check,
  Save,
  Building2,
  Calendar,
  FileText,
  Tag,
  DollarSign,
  Trash2,
  FileCode2,
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
  const [activeTab, setActiveTab] = useState<'details' | 'raw'>('details');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="transaction-detail-modal"
        className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {mode === 'edit' ? 'Edit Voucher' : 'Voucher Details'}
                </h3>
                <span className="text-xs font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                  {transaction.id.slice(0, 10)}
                </span>
              </div>
              <p className="text-xs text-stone-500">Booked: {new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                View
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs (Details vs Raw Document) */}
        <div className="px-6 border-b border-stone-100 flex items-center gap-4 text-xs font-bold bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Voucher Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Raw Source Document</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'raw' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Original Ingested OCR / Text</span>
                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedRaw ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRaw ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
                {transaction.rawText || 'No raw text archived for this voucher.'}
              </pre>
            </div>
          ) : mode === 'view' ? (
            <div className="space-y-5">
              {/* Status & Confidence Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      transaction.status === 'Verified'
                        ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-900 border border-amber-500/25'
                    }`}
                  >
                    {transaction.status === 'Verified' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{transaction.status}</span>
                  </span>
                </div>
                <ConfidenceBadge score={transaction.confidence} size="sm" />
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Vendor</span>
                  <p className="text-sm font-bold text-stone-900">{transaction.vendor}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Invoice Number</span>
                  <p className="text-sm font-mono font-bold text-stone-900">
                    {transaction.invoiceNumber || 'None Specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Transaction Date</span>
                  <p className="text-sm font-mono text-stone-900">{transaction.transactionDate}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Category</span>
                  <p className="text-sm font-semibold text-stone-900">{transaction.category}</p>
                </div>
              </div>

              {/* Financial Box */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Total Booked Expense ({transaction.currency || 'INR'})
                </div>
                <div className="text-3xl font-bold font-mono text-emerald-400">
                  {transaction.currency === 'INR' ? '₹' : transaction.currency === 'USD' ? '$' : transaction.currency}{' '}
                  {transaction.totalAmount.toLocaleString()}
                </div>
                {(transaction.subtotal !== null || transaction.taxAmount !== null) && (
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-300">
                    <span>Subtotal: {transaction.subtotal?.toLocaleString() || '-'}</span>
                    <span>Tax / GST: {transaction.taxAmount?.toLocaleString() || '-'}</span>
                  </div>
                )}
              </div>

              {/* Memo */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-stone-400">Accounting Memo</span>
                <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {transaction.shortDescription || 'No description entered.'}
                </p>
              </div>
            </div>
          ) : (
            <form id="edit-transaction-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={e => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
                  >
                    {CANONICAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Needs Review">Needs Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Subtotal</label>
                  <input
                    type="number"
                    step="any"
                    value={subtotal}
                    onChange={e => setSubtotal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Tax</label>
                  <input
                    type="number"
                    step="any"
                    value={taxAmount}
                    onChange={e => setTaxAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Total</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Memo</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(transaction.id);
                      onClose();
                    }}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Voucher</span>
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-stone-950" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
