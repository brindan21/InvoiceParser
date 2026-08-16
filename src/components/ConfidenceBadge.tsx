import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0.00 to 1.00
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fieldLabel?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  showLabel = true,
  size = 'md',
  fieldLabel,
}) => {
  const percentage = Math.round(score * 100);

  let variant: 'high' | 'medium' | 'low';
  let badgeColor = '';
  let dotColor = '';
  let Icon = CheckCircle2;

  if (percentage >= 90) {
    variant = 'high';
    badgeColor = 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20';
    dotColor = 'bg-emerald-500';
    Icon = ShieldCheck;
  } else if (percentage >= 70) {
    variant = 'medium';
    badgeColor = 'bg-amber-500/10 text-amber-900 border-amber-500/25';
    dotColor = 'bg-amber-500';
    Icon = AlertTriangle;
  } else {
    variant = 'low';
    badgeColor = 'bg-rose-500/10 text-rose-900 border-rose-500/25';
    dotColor = 'bg-rose-500';
    Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-mono font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  const labelText =
    variant === 'high'
      ? 'High Confidence'
      : variant === 'medium'
      ? 'Medium Confidence'
      : 'Needs Review';

  return (
    <span
      id={`confidence-badge-${percentage}`}
      title={fieldLabel ? `${fieldLabel}: ${percentage}% confidence (${labelText})` : `${percentage}% AI Confidence`}
      className={`inline-flex items-center rounded-full border shadow-2xs ${badgeColor} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="font-mono font-semibold">{percentage}%</span>
      {showLabel && <span className="opacity-90">{labelText}</span>}
    </span>
  );
};
