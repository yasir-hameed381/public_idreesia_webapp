'use client';

import React from 'react';

interface GlobalLoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function GlobalLoading({ 
  text = 'Loading...', 
  fullScreen = true 
}: GlobalLoadingProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-white dark:bg-zinc-900'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Spinner matching Laravel's style */}
        <div className="relative inline-flex">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-zinc-700 border-t-[#29d] rounded-full"></div>
        </div>
        {text && (
          <p className="mt-4 text-gray-600 dark:text-zinc-400 text-sm font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Component Loading Skeleton
export function ComponentSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6"></div>
    </div>
  );
}

// Card Loading Skeleton
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
      <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}

// Table Loading Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 dark:bg-zinc-700 rounded"></div>
      ))}
    </div>
  );
}

