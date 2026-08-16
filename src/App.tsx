/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  Navbar,
} from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ParserView } from './components/ParserView';
import { LedgerView } from './components/LedgerView';
import { TransactionModal } from './components/TransactionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import {
  AIInsight,
  LedgerTransaction,
} from './types';
import {
  calculateDashboardMetrics,
  clearLedgerStorage,
  deleteTransactionFromStorage,
  getStoredTransactions,
  resetLedgerStorage,
  saveTransactionToStorage,
} from './services/ledger/ledgerStorage';
import { CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';

export default function App() {
  // Core Data State
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() =>
    getStoredTransactions()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [ledgerInitialFilter, setLedgerInitialFilter] = useState<'Needs Review' | 'Verified' | null>(null);

  // Modal States
  const [modalTransaction, setModalTransaction] = useState<LedgerTransaction | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [batchDeleteIds, setBatchDeleteIds] = useState<string[] | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // AI Insights state
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Compute metrics dynamically
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(transactions);
  }, [transactions]);

  // Load insights from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchInsights() {
      if (transactions.length === 0) {
        setInsights([]);
        return;
      }

      setIsLoadingInsights(true);
      try {
        const res = await fetch('/api/generate-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.insights)) {
            setInsights(data.insights);
          }
        }
      } catch (e) {
        console.error('Could not fetch insights:', e);
      } finally {
        if (isMounted) setIsLoadingInsights(false);
      }
    }

    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, [transactions.length]);

  // Save new transaction from parser review panel
  const handleSaveToLedger = (newTx: LedgerTransaction) => {
    const updated = saveTransactionToStorage(newTx);
    setTransactions(updated);
    showToast(
      `Transaction for ${newTx.vendor} (${newTx.currency} ${newTx.totalAmount.toLocaleString()}) saved to ledger!`,
      'success'
    );
    setActiveTab('ledger');
  };

  // Update existing transaction
  const handleUpdateTransaction = (updatedTx: LedgerTransaction) => {
    const updated = saveTransactionToStorage(updatedTx);
    setTransactions(updated);
    showToast(`Updated transaction #${updatedTx.id.slice(0, 6)} successfully.`, 'info');
  };

  // Single transaction delete confirmation
  const handleConfirmSingleDelete = () => {
    if (deleteTargetId) {
      const updated = deleteTransactionFromStorage(deleteTargetId);
      setTransactions(updated);
      setDeleteTargetId(null);
      showToast('Transaction removed from ledger.', 'info');
    }
  };

  // Batch verify
  const handleBatchVerify = (ids: string[]) => {
    let updatedList = [...transactions];
    ids.forEach(id => {
      const idx = updatedList.findIndex(t => t.id === id);
      if (idx >= 0) {
        updatedList[idx] = {
          ...updatedList[idx],
          status: 'Verified',
          updatedAt: new Date().toISOString(),
        };
        saveTransactionToStorage(updatedList[idx]);
      }
    });
    setTransactions(updatedList);
    showToast(`Marked ${ids.length} transaction${ids.length > 1 ? 's' : ''} as Verified.`, 'success');
  };

  // Batch delete confirmation
  const handleConfirmBatchDelete = () => {
    if (batchDeleteIds && batchDeleteIds.length > 0) {
      let updatedList = [...transactions];
      batchDeleteIds.forEach(id => {
        updatedList = deleteTransactionFromStorage(id);
      });
      setTransactions(updatedList);
      setBatchDeleteIds(null);
      showToast(`Deleted ${batchDeleteIds.length} transactions from ledger.`, 'info');
    }
  };

  // Reset to default sample dataset
  const handleConfirmReset = () => {
    const sample = resetLedgerStorage();
    setTransactions(sample);
    setShowResetConfirm(false);
    showToast('Reset ledger to default sample D2C transactions.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2926] font-sans flex flex-col selection:bg-[#5A5A40] selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          setLedgerInitialFilter(null);
        }}
        metrics={metrics}
        onResetSampleData={() => setShowResetConfirm(true)}
      />

      {/* Main App Content Body */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div
            id="app-toast-notification"
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-[#2C2926] text-white border-stone-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950 text-white border-amber-800'
                : 'bg-[#5A5A40] text-white border-stone-600'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-stone-200" />}
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-stone-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            transactions={transactions}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            onNavigateToParser={() => setActiveTab('parser')}
            onNavigateToLedger={statusFilter => {
              if (statusFilter) {
                setLedgerInitialFilter(statusFilter);
              } else {
                setLedgerInitialFilter(null);
              }
              setActiveTab('ledger');
            }}
            onViewTransaction={tx => {
              setModalTransaction(tx);
              setModalMode('view');
            }}
            onEditTransaction={tx => {
              setModalTransaction(tx);
              setModalMode('edit');
            }}
            onDeleteTransaction={id => setDeleteTargetId(id)}
          />
        )}

        {activeTab === 'parser' && (
          <ParserView
            existingTransactions={transactions}
            onSaveToLedger={handleSaveToLedger}
            onNavigateToLedger={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerView
            transactions={transactions}
            initialStatusFilter={ledgerInitialFilter}
            onNavigateToParser={() => setActiveTab('parser')}
            onViewTransaction={tx => {
              setModalTransaction(tx);
              setModalMode('view');
            }}
            onEditTransaction={tx => {
              setModalTransaction(tx);
              setModalMode('edit');
            }}
            onDeleteTransaction={id => setDeleteTargetId(id)}
            onBatchVerify={handleBatchVerify}
            onBatchDelete={ids => setBatchDeleteIds(ids)}
          />
        )}
      </main>

      {/* Transaction View / Edit Modal */}
      {modalTransaction && (
        <TransactionModal
          transaction={modalTransaction}
          mode={modalMode}
          onClose={() => setModalTransaction(null)}
          onSave={handleUpdateTransaction}
          onDelete={id => {
            setDeleteTargetId(id);
            setModalTransaction(null);
          }}
        />
      )}

      {/* Single Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this entry from your running ledger? This action cannot be undone."
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Batch Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={batchDeleteIds !== null && batchDeleteIds.length > 0}
        title="Delete Selected Transactions"
        message={`Are you sure you want to delete ${batchDeleteIds?.length} selected transactions from your running ledger?`}
        onConfirm={handleConfirmBatchDelete}
        onCancel={() => setBatchDeleteIds(null)}
      />

      {/* Reset Sample Data Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showResetConfirm}
        title="Reset to Sample D2C Ledger"
        message="This will reload the initial 8 sample D2C business transactions in INR (Meta Ads, AWS, Delhivery, Kraft Packaging, CA Audit retainer, etc.). Any new custom invoices you saved will be replaced."
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Fintech Footer */}
      <footer className="mt-auto border-t border-stone-200/90 bg-[#F4F3EE] py-4 px-4 sm:px-8 text-center text-xs text-[#706B63]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">LedgerAI</span>
            <span>·</span>
            <span>Automated AI Bookkeeping & Invoice Extraction Engine</span>
          </div>
          <div className="text-[#8C877D]">
            Powered by Gemini 2.5 Flash · Deterministic Financial Validation · Human-in-the-Loop Review
          </div>
        </div>
      </footer>
    </div>
  );
}
