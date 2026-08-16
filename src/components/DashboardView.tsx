import React from 'react';
import {
  DollarSign,
  Receipt,
  Users,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  PieChart,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import {
  AIInsight,
  DashboardMetrics,
  LedgerTransaction,
} from '../types';
import { formatINR } from '../services/ledger/ledgerStorage';
import { ConfidenceBadge } from './ConfidenceBadge';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  transactions: LedgerTransaction[];
  insights: AIInsight[];
  isLoadingInsights?: boolean;
  onNavigateToParser: () => void;
  onNavigateToLedger: (filterStatus?: 'Needs Review' | 'Verified') => void;
  onViewTransaction: (transaction: LedgerTransaction) => void;
  onEditTransaction: (transaction: LedgerTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

// Category visual color accents in Natural Earthy Tones
const CATEGORY_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  'Marketing & Advertising': { bar: 'bg-[#5A5A40]', text: 'text-[#5A5A40]', bg: 'bg-[#5A5A40]/10' },
  'Software & SaaS': { bar: 'bg-[#706B63]', text: 'text-[#706B63]', bg: 'bg-stone-100' },
  'Inventory & Raw Materials': { bar: 'bg-[#3D5A40]', text: 'text-[#3D5A40]', bg: 'bg-stone-100' },
  'Logistics & Shipping': { bar: 'bg-[#D97706]', text: 'text-[#B45309]', bg: 'bg-orange-50' },
  'Equipment & Hardware': { bar: 'bg-[#8C877D]', text: 'text-[#706B63]', bg: 'bg-stone-100' },
  'Professional Services': { bar: 'bg-[#4A5D4E]', text: 'text-[#4A5D4E]', bg: 'bg-stone-100' },
  'Office Supplies': { bar: 'bg-[#A39E93]', text: 'text-[#706B63]', bg: 'bg-stone-100' },
  'Travel': { bar: 'bg-[#B45309]', text: 'text-[#B45309]', bg: 'bg-orange-50' },
  'Meals & Entertainment': { bar: 'bg-[#9A3412]', text: 'text-[#9A3412]', bg: 'bg-orange-50' },
  'Rent & Utilities': { bar: 'bg-[#525252]', text: 'text-[#525252]', bg: 'bg-stone-100' },
  'Salaries & Contractors': { bar: 'bg-[#2E4036]', text: 'text-[#2E4036]', bg: 'bg-stone-100' },
  'Banking & Financial Fees': { bar: 'bg-[#78716C]', text: 'text-[#78716C]', bg: 'bg-stone-100' },
  'Taxes & Government Fees': { bar: 'bg-[#44403C]', text: 'text-[#44403C]', bg: 'bg-stone-100' },
  'Customer Support': { bar: 'bg-[#656D4A]', text: 'text-[#656D4A]', bg: 'bg-stone-100' },
  'Miscellaneous': { bar: 'bg-[#A8A29E]', text: 'text-[#78716C]', bg: 'bg-stone-100' },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  transactions,
  insights,
  onNavigateToParser,
  onNavigateToLedger,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div id="dashboard-view" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Finance Operations Dashboard</h1>
            <span className="text-xs bg-stone-100 text-[#5A5A40] border border-stone-200 font-medium px-2.5 py-0.5 rounded-full">
              Live Month-End
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#706B63] mt-1.5 leading-relaxed">
            Real-time ledger entries, automated expense categorization, and validation audits for Neha's finance desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="dashboard-parse-cta-btn"
            type="button"
            onClick={onNavigateToParser}
            className="bg-[#5A5A40] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#484833] active:bg-[#3C3C2B] transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Parse New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div
          id="kpi-total-spend"
          className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:border-stone-300 transition-all"
        >
          <div className="flex items-center justify-between text-[#706B63]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Spend</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#5A5A40]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
              {metrics.totalSpendFormatted}
            </div>
            <div className="mt-1 text-xs text-[#706B63]">
              Across {metrics.transactionCount} booked transactions
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div
          id="kpi-total-transactions"
          className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:border-stone-300 transition-all"
        >
          <div className="flex items-center justify-between text-[#706B63]">
            <span className="text-xs font-semibold uppercase tracking-wider">Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#5A5A40]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
              {metrics.transactionCount}
            </div>
            <div className="mt-1 text-xs text-[#5A5A40] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.verifiedCount} Verified ({metrics.transactionCount ? Math.round((metrics.verifiedCount / metrics.transactionCount) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Vendors Count */}
        <div
          id="kpi-vendors-count"
          className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:border-stone-300 transition-all"
        >
          <div className="flex items-center justify-between text-[#706B63]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Vendors</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#5A5A40]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
              {metrics.vendorCount}
            </div>
            <div className="mt-1 text-xs text-[#706B63] truncate" title={metrics.largestVendor?.vendor}>
              Top: {metrics.largestVendor ? metrics.largestVendor.vendor : 'None'}
            </div>
          </div>
        </div>

        {/* Needs Review */}
        <div
          id="kpi-needs-review"
          onClick={() => onNavigateToLedger('Needs Review')}
          className={`cursor-pointer rounded-2xl p-5 shadow-2xs transition-all border ${
            metrics.needsReviewCount > 0
              ? 'bg-orange-50/50 border-orange-200 hover:bg-orange-50/80'
              : 'bg-white border-stone-200/90 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between text-[#706B63]">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                metrics.needsReviewCount > 0 ? 'text-[#92400E]' : 'text-[#706B63]'
              }`}
            >
              Needs Review
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metrics.needsReviewCount > 0
                  ? 'bg-orange-100 text-[#D97706]'
                  : 'bg-stone-100 text-[#706B63]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight ${
                metrics.needsReviewCount > 0 ? 'text-[#78350F]' : 'text-[#1A1A1A]'
              }`}
            >
              {metrics.needsReviewCount}
            </div>
            <div
              className={`mt-1 text-xs font-medium flex items-center justify-between ${
                metrics.needsReviewCount > 0 ? 'text-[#B45309]' : 'text-[#8C877D]'
              }`}
            >
              <span>{metrics.needsReviewCount > 0 ? 'Action required for close' : 'All transactions clear'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Spending by Category & Smart AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#5A5A40]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Spending by Canonical Category</h2>
            </div>
            <span className="text-xs text-[#706B63]">{metrics.categoryBreakdown.length} active categories</span>
          </div>

          {/* Stacked Multi-color Distribution Bar */}
          {metrics.totalSpendINR > 0 && (
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                {metrics.categoryBreakdown.map((cat, idx) => {
                  const style = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Miscellaneous'];
                  return (
                    <div
                      key={idx}
                      className={`${style.bar} h-full transition-all`}
                      style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                      title={`${cat.category}: ${formatINR(cat.amount)} (${cat.percentage}%)`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Category List */}
          <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
            {metrics.categoryBreakdown.map((cat, idx) => {
              const style = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Miscellaneous'];
              return (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.bar}`} />
                    <span className="font-medium text-[#1A1A1A]">{cat.category}</span>
                    <span className="text-[#8C877D] font-mono text-[11px]">({cat.count} txns)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[#1A1A1A] font-mono">{formatINR(cat.amount)}</span>
                    <span className="text-[#706B63] font-mono w-10 text-right">{cat.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart AI Insights (5 cols) */}
        <div className="lg:col-span-5 bg-[#F4F3EE] border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#5A5A40] flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Smart AI Insights</h2>
            </div>
            <span className="text-[11px] font-mono text-[#5A5A40] bg-white/80 border border-stone-200 px-2 py-0.5 rounded-full">
              Month-End Engine
            </span>
          </div>

          <div className="space-y-3">
            {insights.map(ins => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs hover:border-[#5A5A40]/40 transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    {ins.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />}
                    {ins.type === 'trend' && <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />}
                    {ins.type === 'highlight' && <Lightbulb className="w-3.5 h-3.5 text-[#5A5A40]" />}
                    <span>{ins.title}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      ins.impact === 'high'
                        ? 'bg-orange-100 text-[#92400E]'
                        : ins.impact === 'medium'
                        ? 'bg-stone-100 text-[#5A5A40]'
                        : 'bg-stone-100 text-[#706B63]'
                    }`}
                  >
                    {ins.impact}
                  </span>
                </div>
                <p className="text-xs text-[#706B63] leading-relaxed">{ins.description}</p>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="p-4 text-center text-xs text-[#706B63]">
                No insights generated yet. Add transactions to see bookkeeping analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Recent Transactions</h2>
            <p className="text-xs text-[#706B63] mt-0.5">Latest entries extracted and booked to the ledger.</p>
          </div>

          <button
            id="view-full-ledger-btn"
            type="button"
            onClick={() => onNavigateToLedger()}
            className="text-xs font-semibold text-[#5A5A40] hover:text-[#484833] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Full Running Ledger ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50/90 text-[#706B63] border-b border-stone-200 font-medium">
              <tr>
                <th className="px-3.5 py-3">Date</th>
                <th className="px-3.5 py-3">Vendor</th>
                <th className="px-3.5 py-3">Category</th>
                <th className="px-3.5 py-3 text-right">Amount</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3">AI Confidence</th>
                <th className="px-3.5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-3.5 py-3 font-mono text-[#706B63] whitespace-nowrap">{tx.transactionDate}</td>
                  <td className="px-3.5 py-3">
                    <div className="font-medium text-[#1A1A1A]">{tx.vendor}</div>
                    {tx.invoiceNumber && (
                      <div className="text-[11px] text-[#8C877D] font-mono">#{tx.invoiceNumber}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-[#5A5A40] border border-stone-200/80">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono font-semibold text-[#1A1A1A] whitespace-nowrap">
                    {tx.currency === 'INR' ? formatINR(tx.totalAmount) : `${tx.currency} ${tx.totalAmount.toLocaleString()}`}
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        tx.status === 'Verified'
                          ? 'bg-stone-100 text-[#5A5A40] border border-stone-200'
                          : 'bg-orange-50 text-[#B45309] border border-orange-200'
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
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <ConfidenceBadge score={tx.confidence} size="sm" />
                  </td>
                  <td className="px-3.5 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewTransaction(tx)}
                        className="p-1 rounded text-[#706B63] hover:text-[#1A1A1A] hover:bg-stone-100 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 rounded text-[#706B63] hover:text-[#5A5A40] hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 rounded text-[#706B63] hover:text-[#92400E] hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
