import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit2,
  PlusCircle,
  FileSpreadsheet,
  FileCode,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  CANONICAL_CATEGORIES,
  LedgerTransaction,
} from '../types';
import {
  exportTransactionsToCSV,
  exportTransactionsToJSON,
  formatINR,
} from '../services/ledger/ledgerStorage';
import { ConfidenceBadge } from './ConfidenceBadge';

interface LedgerViewProps {
  transactions: LedgerTransaction[];
  initialStatusFilter?: 'Needs Review' | 'Verified' | null;
  onNavigateToParser: () => void;
  onViewTransaction: (transaction: LedgerTransaction) => void;
  onEditTransaction: (transaction: LedgerTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onBatchVerify: (ids: string[]) => void;
  onBatchDelete: (ids: string[]) => void;
}

type SortField = 'date' | 'vendor' | 'amount' | 'confidence';
type SortOrder = 'asc' | 'desc';

export const LedgerView: React.FC<LedgerViewProps> = ({
  transactions,
  initialStatusFilter = null,
  onNavigateToParser,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onBatchVerify,
  onBatchDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Verified' | 'Needs Review'>(
    initialStatusFilter || 'ALL'
  );
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter and Sort Logic
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchVendor = tx.vendor.toLowerCase().includes(q);
          const matchDesc = (tx.shortDescription || '').toLowerCase().includes(q);
          const matchInv = (tx.invoiceNumber || '').toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          if (!matchVendor && !matchDesc && !matchInv && !matchCat) return false;
        }

        // Category Filter
        if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) {
          return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
        } else if (sortField === 'vendor') {
          cmp = a.vendor.localeCompare(b.vendor);
        } else if (sortField === 'amount') {
          cmp = a.totalAmount - b.totalAmount;
        } else if (sortField === 'confidence') {
          cmp = a.confidence - b.confidence;
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [transactions, searchQuery, selectedCategory, statusFilter, sortField, sortOrder]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTxIds(filteredTransactions.map(t => t.id));
    } else {
      setSelectedTxIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedTxIds.includes(id)) {
      setSelectedTxIds(selectedTxIds.filter(i => i !== id));
    } else {
      setSelectedTxIds([...selectedTxIds, id]);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = selectedTxIds.length > 0
      ? transactions.filter(t => selectedTxIds.includes(t.id))
      : filteredTransactions;
    const csv = exportTransactionsToCSV(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const dataToExport = selectedTxIds.length > 0
      ? transactions.filter(t => selectedTxIds.includes(t.id))
      : filteredTransactions;
    const json = exportTransactionsToJSON(dataToExport);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStatusFilter('ALL');
  };

  const isFiltered = searchQuery !== '' || selectedCategory !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div id="ledger-view" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Running Ledger</h1>
            <span className="text-xs bg-stone-100 text-[#5A5A40] font-mono px-2.5 py-0.5 rounded-full font-semibold border border-stone-200">
              {transactions.length} Total Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#706B63] mt-1">
            Complete audit trail of verified and pending expense transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="export-ledger-dropdown-btn"
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 text-xs font-semibold text-[#2C2926] bg-white border border-stone-300 hover:bg-stone-50 rounded-full shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#706B63]" />
              <span>Export {selectedTxIds.length > 0 ? `(${selectedTxIds.length})` : ''}</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 z-20 text-xs">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2 text-[#2C2926] hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2 text-[#2C2926] hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#D97706]" />
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          <button
            id="ledger-add-receipt-cta"
            type="button"
            onClick={onNavigateToParser}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3C3C2B] rounded-full shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Receipt</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input (5 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8C877D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="ledger-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendor, invoice #, note, category..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all placeholder:text-[#8C877D]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877D] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown (4 cols) */}
          <div className="sm:col-span-4">
            <select
              id="ledger-category-filter"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 text-[#2C2926] font-medium"
            >
              <option value="ALL">All Expense Categories</option>
              {CANONICAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons (3 cols) */}
          <div className="sm:col-span-3 flex items-center justify-end">
            <div className="inline-flex rounded-full border border-stone-200 p-0.5 bg-stone-100 w-full justify-between">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#1A1A1A] shadow-2xs font-semibold'
                    : 'text-[#706B63] hover:text-[#1A1A1A]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Verified')}
                className={`flex-1 py-1 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  statusFilter === 'Verified'
                    ? 'bg-white text-[#5A5A40] shadow-2xs font-bold'
                    : 'text-[#706B63] hover:text-[#1A1A1A]'
                }`}
              >
                Verified
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Needs Review')}
                className={`flex-1 py-1 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  statusFilter === 'Needs Review'
                    ? 'bg-white text-[#B45309] shadow-2xs font-bold'
                    : 'text-[#706B63] hover:text-[#1A1A1A]'
                }`}
              >
                Review
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Pill row (if any active) */}
        {isFiltered && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-[#706B63]">
            <span>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#5A5A40] hover:text-[#484833] font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Batch Selection Action Bar (if items selected) */}
      {selectedTxIds.length > 0 && (
        <div className="bg-[#2C2926] text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-md">
          <div className="text-xs font-medium">
            <span className="font-bold text-white bg-[#5A5A40] px-2.5 py-0.5 rounded-full mr-2">
              {selectedTxIds.length}
            </span>
            transactions selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onBatchVerify(selectedTxIds);
                setSelectedTxIds([]);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#5A5A40] hover:bg-[#484833] rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Verified
            </button>
            <button
              type="button"
              onClick={() => {
                onBatchDelete(selectedTxIds);
                setSelectedTxIds([]);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-red-800/80 hover:bg-red-800 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedTxIds([])}
              className="px-3 py-1.5 text-xs text-stone-300 hover:text-white cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Ledger Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-[#8C877D] mx-auto flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">
              {transactions.length === 0 ? 'Your ledger is ready.' : 'No matching transactions found'}
            </h3>
            <p className="text-xs sm:text-sm text-[#706B63] max-w-sm mx-auto">
              {transactions.length === 0
                ? 'Parse your first invoice to start tracking expenses and running month-end close.'
                : 'Try adjusting your search terms or clearing active filters.'}
            </p>
            <button
              type="button"
              onClick={onNavigateToParser}
              className="mt-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Parse Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F3EE] text-[#706B63] border-b border-stone-200 font-semibold select-none">
                <tr>
                  <th className="px-4 py-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredTransactions.length > 0 &&
                        selectedTxIds.length === filteredTransactions.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-stone-300 text-[#5A5A40] focus:ring-[#5A5A40]"
                    />
                  </th>

                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-[#5A5A40]"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-[#8C877D]" />
                    </div>
                  </th>

                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-[#5A5A40]"
                    onClick={() => toggleSort('vendor')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Vendor</span>
                      <ArrowUpDown className="w-3 h-3 text-[#8C877D]" />
                    </div>
                  </th>

                  <th className="px-4 py-3.5">Description</th>

                  <th className="px-4 py-3.5">Category</th>

                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-[#5A5A40]"
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3 text-[#8C877D]" />
                    </div>
                  </th>

                  <th className="px-4 py-3.5 text-center">Status</th>

                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-[#5A5A40]"
                    onClick={() => toggleSort('confidence')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Confidence</span>
                      <ArrowUpDown className="w-3 h-3 text-[#8C877D]" />
                    </div>
                  </th>

                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.map(tx => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        isSelected ? 'bg-[#5A5A40]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(tx.id)}
                          className="rounded border-stone-300 text-[#5A5A40] focus:ring-[#5A5A40]"
                        />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 font-mono text-[#706B63] whitespace-nowrap">
                        {tx.transactionDate}
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#1A1A1A]">{tx.vendor}</div>
                        {tx.invoiceNumber && (
                          <div className="text-[11px] text-[#8C877D] font-mono">
                            Inv: {tx.invoiceNumber}
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 text-[#706B63] max-w-xs truncate" title={tx.shortDescription}>
                        {tx.shortDescription}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-[#5A5A40] border border-stone-200">
                          {tx.category}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-[#1A1A1A] whitespace-nowrap">
                        {tx.currency === 'INR'
                          ? formatINR(tx.totalAmount)
                          : `${tx.currency} ${tx.totalAmount.toLocaleString()}`}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            tx.status === 'Verified'
                              ? 'bg-stone-100 text-[#5A5A40] border border-stone-300'
                              : 'bg-orange-50 text-[#92400E] border border-orange-200'
                          }`}
                        >
                          {tx.status === 'Verified' ? (
                            <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                          )}
                          {tx.status}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <ConfidenceBadge score={tx.confidence} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewTransaction(tx)}
                            className="p-1.5 rounded-lg text-[#706B63] hover:text-[#1A1A1A] hover:bg-stone-100 transition-colors cursor-pointer"
                            title="View full record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-lg text-[#706B63] hover:text-[#5A5A40] hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Edit record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-[#706B63] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
