import React from 'react';
import {
  Receipt,
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  RotateCcw,
  Sparkles,
  AlertTriangle,
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-6">
            <button
              id="nav-logo-btn"
              type="button"
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-[#484833] transition-colors">
                L
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg text-[#1A1A1A] tracking-tight">LedgerAI</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-[#5A5A40] border border-stone-200">
                    Finance OS
                  </span>
                </div>
                <div className="text-[11px] text-[#706B63] font-medium leading-none">
                  D2C Month-End Operations
                </div>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-tab-dashboard"
                type="button"
                onClick={() => onTabChange('dashboard')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold border border-[#5A5A40]/20'
                    : 'text-[#706B63] hover:text-[#5A5A40] hover:bg-stone-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-parser"
                type="button"
                onClick={() => onTabChange('parser')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'parser'
                    ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold border border-[#5A5A40]/20'
                    : 'text-[#706B63] hover:text-[#5A5A40] hover:bg-stone-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <span>Parse Invoice</span>
                <span className="text-[10px] bg-stone-200/80 text-[#5A5A40] px-1.5 py-0.2 rounded font-mono font-bold">
                  AI
                </span>
              </button>

              <button
                id="nav-tab-ledger"
                type="button"
                onClick={() => onTabChange('ledger')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold border border-[#5A5A40]/20'
                    : 'text-[#706B63] hover:text-[#5A5A40] hover:bg-stone-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Running Ledger</span>
                <span className="text-[10px] bg-stone-200/80 text-[#706B63] px-1.5 py-0.2 rounded font-mono">
                  {metrics.transactionCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Status Pill */}
            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-stone-200">
              <div className="text-right">
                <div className="text-[10px] text-[#8C877D] uppercase font-semibold">Booked Spend</div>
                <div className="text-xs font-bold text-[#1A1A1A] font-mono">
                  {metrics.totalSpendFormatted}
                </div>
              </div>

              {metrics.needsReviewCount > 0 && (
                <button
                  type="button"
                  onClick={() => onTabChange('ledger')}
                  className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#92400E] text-[11px] font-semibold flex items-center gap-1 hover:bg-orange-100/80 transition-colors cursor-pointer"
                  title="Transactions requiring verification"
                >
                  <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                  <span>{metrics.needsReviewCount} Review</span>
                </button>
              )}
            </div>

            {/* Reset Sample Button */}
            <button
              id="reset-sample-data-btn"
              type="button"
              onClick={onResetSampleData}
              className="text-xs font-medium text-[#706B63] hover:text-[#1A1A1A] hover:bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset ledger to default sample transactions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Sample</span>
            </button>

            {/* Primary Action Button */}
            {activeTab !== 'parser' && (
              <button
                id="header-parse-btn"
                type="button"
                onClick={() => onTabChange('parser')}
                className="bg-[#5A5A40] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#484833] active:bg-[#3C3C2B] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Parse Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around border-t border-stone-100 py-2">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold' : 'text-[#706B63]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onTabChange('parser')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
              activeTab === 'parser' ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold' : 'text-[#706B63]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
            Parse
          </button>
          <button
            type="button"
            onClick={() => onTabChange('ledger')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
              activeTab === 'ledger' ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold' : 'text-[#706B63]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ledger ({metrics.transactionCount})
          </button>
        </div>
      </div>
    </header>
  );
};
