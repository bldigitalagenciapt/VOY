import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  percentage: number;
  label: string;
  evolution?: string; // e.g., "+5%"
  size?: number;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
}

export function CircularProgress({
  percentage,
  label,
  evolution,
  size = 80,
  strokeWidth = 8,
  className,
  onClick
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 rounded-[2rem] bg-card border border-border shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer",
        className
      )}
    >
      {/* Label and Evolution */}
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        {evolution && (
          <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
            {evolution}
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-center">
        {/* SVG Circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/30"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Percentage Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-foreground">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
