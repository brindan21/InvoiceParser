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
  ShieldCheck,
  Building2,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  FileCheck2,
  FileSpreadsheet,
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

// Category visual badges & colors
const CATEGORY_STYLES: Record<string, { badge: string; dot: string; bar: string }> = {
  'Marketing & Advertising': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', bar: 'bg-indigo-500' },
  'Software & SaaS': { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  'Inventory & Raw Materials': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  'Logistics & Shipping': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  'Equipment & Hardware': { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', bar: 'bg-purple-500' },
  'Professional Services': { badge: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', bar: 'bg-teal-500' },
  'Office Supplies': { badge: 'bg-stone-100 text-stone-700 border-stone-200', dot: 'bg-stone-500', bar: 'bg-stone-500' },
  'Travel': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  'Rent & Utilities': { badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500', bar: 'bg-slate-500' },
  'Miscellaneous': { badge: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400', bar: 'bg-stone-400' },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] || { badge: 'bg-stone-100 text-stone-700 border-stone-200', dot: 'bg-stone-500', bar: 'bg-stone-500' };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  transactions,
  insights,
  isLoadingInsights,
  onNavigateToParser,
  onNavigateToLedger,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const recentTransactions = transactions.slice(0, 6);
  const verifiedPercentage = metrics.transactionCount
    ? Math.round((metrics.verifiedCount / metrics.transactionCount) * 100)
    : 0;

  // Calculate Average AI Confidence
  const avgConfidence = transactions.length > 0
    ? Math.round((transactions.reduce((acc, t) => acc + (t.confidence || 0.85), 0) / transactions.length) * 100)
    : 92;

  return (
    <div id="dashboard-view" className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Fiscal Close Status Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-800">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>D2C August 2026 Fiscal Close</span>
              <span className="text-stone-400">·</span>
              <span className="font-mono text-emerald-300 font-semibold">{verifiedPercentage}% Audit Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Finance Operations & Invoice Ledger
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Automated invoice OCR parsing, multi-currency ledger tracking, and human-in-the-loop audit validation for D2C brand operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-parse-cta-btn"
              type="button"
              onClick={onNavigateToParser}
              className="bg-emerald-500 text-stone-950 font-bold hover:bg-emerald-400 active:bg-emerald-600 px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Parse Receipt / Invoice</span>
            </button>

            <button
              id="dashboard-view-ledger-btn"
              type="button"
              onClick={() => onNavigateToLedger()}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-stone-300" />
              <span>View Full Ledger</span>
            </button>
          </div>
        </div>

        {/* Verification Progress Bar in Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-300">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="font-medium shrink-0">Book Verification:</span>
            <div className="w-full bg-white/15 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${verifiedPercentage}%` }}
              />
            </div>
            <span className="font-mono font-bold text-white shrink-0">{metrics.verifiedCount}/{metrics.transactionCount}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>{metrics.needsReviewCount} unreviewed invoices</span>
            <span>·</span>
            <span>Est. GST Input Credit: <strong className="text-stone-200">₹{Math.round(metrics.totalSpend * 0.18).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div
          id="kpi-total-spend"
          className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:border-stone-300 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Spend</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
              {metrics.totalSpendFormatted}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
              <span>Across {metrics.transactionCount} booked vouchers</span>
            </div>
          </div>
        </div>

        {/* Transactions & Verification */}
        <div
          id="kpi-total-transactions"
          className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:border-stone-300 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Vouchers</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
              {metrics.transactionCount}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{metrics.verifiedCount} Verified ({verifiedPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Review Queue Alert Card */}
        <div
          id="kpi-needs-review"
          onClick={() => onNavigateToLedger('Needs Review')}
          className={`border rounded-2xl p-5 shadow-xs transition-all cursor-pointer group ${
            metrics.needsReviewCount > 0
              ? 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Review Queue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-950 tracking-tight flex items-center gap-2">
              <span>{metrics.needsReviewCount}</span>
              {metrics.needsReviewCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Action
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-amber-800">
              <span>Requires auditor sign-off</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* AI Confidence Index Card */}
        <div
          id="kpi-ai-confidence"
          className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:border-stone-300 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">AI Confidence</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
              {avgConfidence}%
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini 3.7 + Deterministic Check</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: AI Insights & Category Spend Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Executive Insights (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">AI Financial Insights & Anomalies</h2>
                <p className="text-xs text-stone-500">Automated ledger analysis for month-end close</p>
              </div>
            </div>

            {isLoadingInsights && (
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Analyzing...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {insights.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                No active insights. Book more vouchers to unlock AI spend trends.
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div
                  key={insight.id || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    insight.type === 'alert'
                      ? 'bg-amber-50/60 border-amber-200/80'
                      : insight.type === 'action'
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : 'bg-stone-50/80 border-stone-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {insight.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {insight.type === 'action' && <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />}
                        <h3 className="text-xs font-bold text-stone-900">{insight.title}</h3>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed pl-6">{insight.description}</p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        insight.impact === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : insight.impact === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {insight.impact} Impact
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Category Distribution & Spend Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Spend by Category</h2>
                <p className="text-xs text-stone-500">Distribution across active ledger</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-stone-700">
              {metrics.categoryBreakdown.length} Categories
            </span>
          </div>

          <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
            {metrics.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">No expense data recorded.</div>
            ) : (
              metrics.categoryBreakdown.map(cat => {
                const style = getCategoryStyle(cat.category);
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <span className="font-semibold text-stone-800 truncate max-w-[160px] sm:max-w-[200px]">
                          {cat.category}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">({cat.count})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-stone-900">{cat.formattedAmount}</span>
                        <span className="text-[11px] text-stone-400 w-9 text-right font-semibold">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
                        style={{ width: `${Math.max(cat.percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Ledger Activity Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Recent Ledger Activity</h2>
              <p className="text-xs text-stone-500">Recently booked and parsed expense vouchers</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToLedger()}
            className="text-xs font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Vendor / Merchant</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">AI Confidence</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentTransactions.map(tx => {
                const style = getCategoryStyle(tx.category);
                return (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors group">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 uppercase text-xs shrink-0">
                          {tx.vendor.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{tx.vendor}</div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {tx.invoiceNumber || tx.id.slice(0, 10)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        <span>{tx.category}</span>
                      </span>
                    </td>

                    <td className="py-3 font-mono text-stone-600">
                      {tx.transactionDate}
                    </td>

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

                    <td className="py-3 text-right pr-2">
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
