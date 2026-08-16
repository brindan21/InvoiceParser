import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

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
  let Icon = CheckCircle2;

  if (percentage >= 90) {
    variant = 'high';
    badgeColor = 'bg-stone-100 text-[#5A5A40] border-stone-200';
    Icon = CheckCircle2;
  } else if (percentage >= 70) {
    variant = 'medium';
    badgeColor = 'bg-orange-50/80 text-[#B45309] border-orange-200/80';
    Icon = AlertTriangle;
  } else {
    variant = 'low';
    badgeColor = 'bg-stone-100 text-[#92400E] border-stone-300';
    Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-mono font-semibold',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
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
      className={`inline-flex items-center rounded-full border ${badgeColor} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{percentage}%</span>
      {showLabel && <span className="opacity-90">{labelText}</span>}
    </span>
  );
};
