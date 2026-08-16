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
  Filter,
  Check,
  ChevronDown,
  Layers,
  ArrowDownUp,
  Tag,
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

// Category style mapping
const CATEGORY_STYLES: Record<string, { badge: string; dot: string }> = {
  'Marketing & Advertising': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Software & SaaS': { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  'Inventory & Raw Materials': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Logistics & Shipping': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Equipment & Hardware': { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Professional Services': { badge: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  'Office Supplies': { badge: 'bg-stone-100 text-stone-700 border-stone-200', dot: 'bg-stone-500' },
  'Travel': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  'Rent & Utilities': { badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  'Miscellaneous': { badge: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] || { badge: 'bg-stone-100 text-stone-700 border-stone-200', dot: 'bg-stone-500' };
}

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

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [transactions]);

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

  return (
    <div id="ledger-view" className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Running General Ledger
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {filteredTransactions.length} of {transactions.length} vouchers shown · Real-time verification queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="export-menu-btn"
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export {selectedTxIds.length > 0 ? `(${selectedTxIds.length})` : 'All'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download as CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-amber-600" />
                  <span>Download as JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Invoice CTA */}
          <button
            id="ledger-add-invoice-btn"
            type="button"
            onClick={onNavigateToParser}
            className="bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="ledger-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendor, invoice #, or memo..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
            {(
              [
                { id: 'ALL', label: 'All Vouchers', count: transactions.length },
                {
                  id: 'Verified',
                  label: 'Verified',
                  count: transactions.filter(t => t.status === 'Verified').length,
                },
                {
                  id: 'Needs Review',
                  label: 'Needs Review',
                  count: transactions.filter(t => t.status === 'Needs Review').length,
                },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200/80 text-stone-700">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories ({transactions.length})
          </button>
          {CANONICAL_CATEGORIES.map(cat => {
            const count = categoryCounts[cat] || 0;
            if (count === 0 && selectedCategory !== cat) return null;
            const isSelected = selectedCategory === cat;
            const style = getCategoryStyle(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : `${style.badge} hover:bg-stone-100`
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <span>{cat}</span>
                <span className="text-[10px] font-mono opacity-80 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredTransactions.length > 0 &&
                      selectedTxIds.length === filteredTransactions.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 cursor-pointer hover:text-stone-900" onClick={() => toggleSort('vendor')}>
                  <div className="flex items-center gap-1.5">
                    <span>Vendor / Merchant</span>
                    <ArrowDownUp className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5 cursor-pointer hover:text-stone-900" onClick={() => toggleSort('date')}>
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowDownUp className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 text-right cursor-pointer hover:text-stone-900"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    <ArrowDownUp className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 text-center">Status</th>
                <th
                  className="py-3.5 text-center cursor-pointer hover:text-stone-900"
                  onClick={() => toggleSort('confidence')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>AI Confidence</span>
                    <ArrowDownUp className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400 space-y-2">
                    <p className="text-sm font-semibold text-stone-600">No matching transactions found</p>
                    <p className="text-xs text-stone-400">Try adjusting your search or category filter</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  const style = getCategoryStyle(tx.category);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-stone-50/70 transition-colors group ${
                        isSelected ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(tx.id)}
                          className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                        />
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 uppercase text-xs shrink-0">
                            {tx.vendor.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900">{tx.vendor}</div>
                            <div className="text-[11px] text-stone-400 font-mono">
                              {tx.invoiceNumber || tx.id.slice(0, 12)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span>{tx.category}</span>
                        </span>
                      </td>

                      <td className="py-3 font-mono text-stone-600">{tx.transactionDate}</td>

                      <td className="py-3 text-right font-mono font-bold text-stone-900">
                        {tx.currency === 'INR' ? '₹' : tx.currency === 'USD' ? '$' : tx.currency}{' '}
                        {tx.totalAmount.toLocaleString()}
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            tx.status === 'Verified'
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-900 border-amber-500/25'
                          }`}
                        >
                          {tx.status === 'Verified' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <ConfidenceBadge score={tx.confidence} size="sm" showLabel={false} />
                      </td>

                      <td className="py-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewTransaction(tx)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            title="Edit Entry"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete Voucher"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Batch Action Bar */}
      {selectedTxIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-6 duration-200 border border-stone-800">
          <span className="text-xs font-bold font-mono text-stone-300">
            {selectedTxIds.length} vouchers selected
          </span>

          <div className="h-4 w-px bg-stone-700" />

          <button
            type="button"
            onClick={() => {
              onBatchVerify(selectedTxIds);
              setSelectedTxIds([]);
            }}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Verify Selected</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onBatchDelete(selectedTxIds);
              setSelectedTxIds([]);
            }}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTxIds([])}
            className="p-1 text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
