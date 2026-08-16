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
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  ScanText,
  Upload,
  Cpu,
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
  const [activeDemoCategory, setActiveDemoCategory] = useState<'all' | 'clean' | 'anomaly' | 'tax-gst' | 'usd'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Reading invoice text...');
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
      setError('Please paste raw invoice or receipt text, or pick one of the sample test cases below.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Normalizing document text & OCR...');
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
          "Could not extract invoice. Please check the text format and try again."
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
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button
            id="back-to-input-btn"
            type="button"
            onClick={() => setParsedResult(null)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
            <span>Re-edit Raw Text / Parse Another</span>
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

  const filteredDemos = DEMO_INVOICES.filter(d => {
    if (activeDemoCategory === 'all') return true;
    return d.categoryTag === activeDemoCategory;
  });

  return (
    <div id="parser-view" className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini 3.7 + Deterministic Audit Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          AI Invoice & Receipt Extraction
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Paste unstructured OCR text, email forwards, or Slack slips. LedgerAI extracts vendors, amounts, GST, and flags duplicates automatically.
        </p>
      </div>

      {/* Main Input Textarea Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ScanText className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Raw Document Text</span>
            <span className="text-[11px] text-stone-400 font-mono">
              ({lineCount} lines · {charCount} chars)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-200"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-stone-600" />
              <span>Paste Clipboard</span>
            </button>
            {rawText && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="raw-invoice-textarea"
            value={rawText}
            onChange={e => {
              setRawText(e.target.value);
              setSelectedDemoId(null);
              setError(null);
            }}
            placeholder={`Paste raw receipt text, OCR output, or Slack invoice message here...

Example:
Amazon Web Services, Inc.
Invoice Number: AWS-2026-889104
Date: 2026-08-14
Total Amount Due: $508.20 USD
Subtotal: $508.20 | Tax: $0.00`}
            rows={8}
            className="w-full p-4 rounded-2xl bg-stone-50/70 border border-stone-200 text-stone-900 placeholder:text-stone-400 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all resize-y"
          />
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            id="parser-error-box"
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Extraction Notice:</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Hud during Analysis */}
        {isAnalyzing && (
          <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3 animate-in fade-in duration-200 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{analysisStep}</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">{analysisProgress}%</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatic GST Split · Duplicate Detection · Multi-Currency</span>
          </div>

          <button
            id="analyze-invoice-btn"
            type="button"
            disabled={isAnalyzing || !rawText.trim()}
            onClick={handleAnalyze}
            className="bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950 disabled:bg-stone-200 disabled:text-stone-400 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Extracting Fields...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Analyze with AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* One-Click Sample Invoices & Test Cases Studio */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">One-Click Sample & Negative Test Cases</h2>
              <p className="text-xs text-stone-500">Instant test templates to evaluate parser resilience</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'clean', label: 'Standard' },
                { id: 'tax-gst', label: 'GST Split' },
                { id: 'usd', label: 'USD' },
                { id: 'anomaly', label: 'Edge / Negative' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDemoCategory(tab.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDemoCategory === tab.id
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredDemos.map(demo => {
            const isSelected = selectedDemoId === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50/60 hover:bg-white text-stone-900 border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-stone-800 text-amber-300'
                          : demo.isMessy
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {demo.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                    {demo.label}
                  </h3>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    {demo.description}
                  </p>
                </div>

                <div className={`text-[10px] font-mono font-medium pt-1 ${isSelected ? 'text-stone-400' : 'text-stone-400'}`}>
                  Click to load text →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
