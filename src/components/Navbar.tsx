import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ReceiptText,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { DashboardMetrics } from '../types';

export type ActiveTab = 'dashboard' | 'parser' | 'ledger';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  metrics: DashboardMetrics;
  onResetSampleData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  metrics,
  onResetSampleData,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-6">
            <button
              id="nav-logo-btn"
              type="button"
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-stone-800 transition-all">
                <ReceiptText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-stone-900 tracking-tight">LedgerAI</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                    Finance OS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium leading-none mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>D2C Close & Bookkeeping</span>
                </div>
              </div>
            </button>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-xl border border-stone-200/60">
              <button
                id="nav-tab-dashboard"
                type="button"
                onClick={() => onTabChange('dashboard')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-parser"
                type="button"
                onClick={() => onTabChange('parser')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'parser'
                    ? 'bg-stone-900 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Parse Invoice</span>
                <span className="text-[10px] bg-stone-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  AI
                </span>
              </button>

              <button
                id="nav-tab-ledger"
                type="button"
                onClick={() => onTabChange('ledger')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Running Ledger</span>
                <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-full font-mono font-medium">
                  {metrics.transactionCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Right Header Controls: KPI Ticker & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Needs Review Pill Warning */}
            {metrics.needsReviewCount > 0 && (
              <button
                id="nav-review-alert-btn"
                type="button"
                onClick={() => onTabChange('ledger')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-medium hover:bg-amber-500/15 transition-colors cursor-pointer"
                title={`${metrics.needsReviewCount} transactions require human review before month-end lock`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{metrics.needsReviewCount} Needs Review</span>
              </button>
            )}

            {/* Quick Spend Summary */}
            <div className="hidden lg:flex flex-col text-right pr-2 border-r border-stone-200">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400 leading-none">
                Total Spend
              </span>
              <span className="text-xs font-bold font-mono text-stone-900 mt-0.5">
                {metrics.totalSpendFormatted}
              </span>
            </div>

            {/* Reset Sample Data Button */}
            <button
              id="nav-reset-data-btn"
              type="button"
              onClick={onResetSampleData}
              title="Reload sample D2C brand transactions"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              id="nav-primary-parse-btn"
              type="button"
              onClick={() => onTabChange('parser')}
              className="bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Add Invoice</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-100 px-2 py-1.5 bg-stone-50/80">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('parser')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'parser' ? 'bg-stone-900 text-white shadow-2xs font-bold' : 'text-stone-500'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Parse AI</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('ledger')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'ledger' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Ledger ({metrics.transactionCount})</span>
        </button>
      </div>
    </header>
  );
};
