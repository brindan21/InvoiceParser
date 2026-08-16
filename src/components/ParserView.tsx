import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
  ClipboardPaste,
  Trash2,
} from 'lucide-react';
import { DEMO_INVOICES, DemoInvoice } from '../data/demoInvoices';
import { LedgerTransaction, ParsedInvoiceData } from '../types';
import { parseInvoiceText } from '../services/ai/invoiceParserService';
import { ReviewPanel } from './ReviewPanel';

interface ParserViewProps {
  existingTransactions: LedgerTransaction[];
  onSaveToLedger: (transaction: LedgerTransaction) => void;
  onNavigateToLedger: () => void;
}

export const ParserView: React.FC<ParserViewProps> = ({
  existingTransactions,
  onSaveToLedger,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Reading invoice...');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedInvoiceData | null>(null);

  const handleSelectDemo = (demo: DemoInvoice) => {
    setSelectedDemoId(demo.id);
    setRawText(demo.text);
    setError(null);
    setParsedResult(null);
  };

  const handleAnalyze = async () => {
    if (!rawText || rawText.trim().length === 0) {
      setError('Please paste raw invoice or receipt text, or pick one of the demo samples above.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Reading invoice text...');
    setAnalysisProgress(15);

    try {
      const result = await parseInvoiceText(rawText, existingTransactions, (step, percent) => {
        setAnalysisStep(step);
        setAnalysisProgress(percent);
      });

      setParsedResult(result);
    } catch (err: any) {
      console.error('Invoice analysis error:', err);
      setError(
        err?.message ||
          "We couldn't confidently extract this invoice. Please check the text format and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setParsedResult(null);
    setError(null);
    setRawText('');
    setSelectedDemoId(null);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
        setSelectedDemoId(null);
        setError(null);
      }
    } catch {
      // Fallback
    }
  };

  if (parsedResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            id="back-to-input-btn"
            onClick={() => setParsedResult(null)}
            className="text-xs font-semibold text-[#706B63] hover:text-[#1A1A1A] flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5A5A40]" />
            Paste Another Invoice / Re-edit Raw Text
          </button>
        </div>
        <ReviewPanel
          parsedData={parsedResult}
          onSave={tx => {
            onSaveToLedger(tx);
          }}
          onCancel={() => setParsedResult(null)}
        />
      </div>
    );
  }

  const charCount = rawText.length;
  const lineCount = rawText ? rawText.split('\n').length : 0;

  return (
    <div id="parser-view" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-[#5A5A40] text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.7 Structured Financial Extraction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Paste Receipt or Invoice
        </h1>
        <p className="text-sm text-[#706B63] max-w-2xl mx-auto leading-relaxed">
          Paste raw receipt, invoice, OCR, email, or Slack text and LedgerAI will structure,
          categorize, and validate it automatically for bookkeeping.
        </p>
      </div>

      {/* One-Click Demo Invoices */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D97706]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
              One-Click Demo Invoices for Judges
            </span>
          </div>
          <span className="text-xs text-[#8C877D]">Click to auto-populate</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {DEMO_INVOICES.map(demo => {
            const isSelected = selectedDemoId === demo.id;
            return (
              <button
                key={demo.id}
                id={`demo-btn-${demo.id}`}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                className={`p-3 rounded-xl text-left transition-all border text-xs flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#5A5A40] ring-2 ring-[#5A5A40]/20'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-[#2C2926]'
                }`}
              >
                <div className="font-semibold truncate">{demo.label}</div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      demo.isMessy
                        ? 'bg-orange-100 text-[#92400E]'
                        : isSelected
                        ? 'bg-[#5A5A40] text-white'
                        : 'bg-stone-200/80 text-[#706B63]'
                    }`}
                  >
                    {demo.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Raw Text Area */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="raw-invoice-textarea" className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#706B63]" />
            Unstructured Receipt / Invoice Text
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="text-xs text-[#706B63] hover:text-[#1A1A1A] bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3 h-3 text-[#5A5A40]" />
              Paste
            </button>
            {rawText && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#92400E] hover:text-[#78350F] bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear input"
              >
                <Trash2 className="w-3 h-3 text-[#D97706]" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            id="raw-invoice-textarea"
            rows={10}
            value={rawText}
            onChange={e => {
              setRawText(e.target.value);
              setSelectedDemoId(null);
              setError(null);
            }}
            placeholder={`Paste raw text from an invoice, email, PDF OCR, or Slack forward here...

Example:
Invoice #INV-2391
Meta Platforms Ireland Ltd
Date: 12 August 2026
Facebook Advertising Campaign: Summer Sale
Subtotal: ₹42,372
GST: ₹7,627
Total Amount Due: ₹49,999
Payment Status: Paid`}
            disabled={isAnalyzing}
            className="w-full p-4 text-sm font-mono bg-[#F9F8F6] border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all leading-relaxed placeholder:text-[#8C877D]"
          />

          <div className="absolute bottom-3 right-3 text-[11px] text-[#706B63] bg-white/90 px-2 py-0.5 rounded-full border border-stone-200 font-mono">
            {lineCount} lines · {charCount} chars
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="parser-error-alert"
            className="p-4 rounded-xl bg-orange-50/80 border border-orange-200 text-[#92400E] text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#78350F]">Extraction Alert</div>
              <div className="mt-0.5 text-xs text-[#92400E] leading-relaxed">{error}</div>
            </div>
          </div>
        )}

        {/* Processing State Card */}
        {isAnalyzing && (
          <div
            id="ai-processing-status"
            className="p-4 rounded-xl bg-[#F4F3EE] border border-stone-200 text-[#1A1A1A] space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-2 text-[#5A5A40]">
                <Loader2 className="w-4 h-4 animate-spin text-[#5A5A40]" />
                {analysisStep}
              </span>
              <span className="font-mono text-[#5A5A40] font-bold">{analysisProgress}%</span>
            </div>

            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#5A5A40] h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>

            <div className="text-[11px] text-[#706B63] flex items-center justify-between">
              <span>Extracting vendor, amounts & category</span>
              <span>Running deterministic validation</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#706B63]">
            <span className="font-semibold text-[#1A1A1A]">Financial Safety:</span> AI proposes,
            validation checks, and you confirm before saving to ledger.
          </div>

          <button
            id="analyze-invoice-btn"
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !rawText.trim()}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isAnalyzing || !rawText.trim()
                ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                : 'bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3C3C2B]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze with AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
