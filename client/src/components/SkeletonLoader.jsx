import React from 'react';

export const SkeletonText = ({ className = 'h-4 w-full' }) => (
  <div className={`shimmer-bg rounded ${className}`}></div>
);

export const SkeletonAvatar = ({ className = 'w-10 h-10' }) => (
  <div className={`shimmer-bg rounded-full ${className}`}></div>
);

export const SkeletonButton = ({ className = 'h-10 w-24' }) => (
  <div className={`shimmer-bg rounded-xl ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
    <div className="flex gap-4">
      <SkeletonAvatar className="w-14 h-14 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-5 w-2/3" />
        <SkeletonText className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <SkeletonText className="h-4 w-full" />
      <SkeletonText className="h-4 w-5/6" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <SkeletonText className="h-6 w-1/4" />
      <SkeletonButton className="h-9 w-28" />
    </div>
  </div>
);

export const SkeletonAnalyticsCard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
    <div className="space-y-2 flex-1">
      <SkeletonText className="h-3 w-1/3" />
      <SkeletonText className="h-8 w-1/2" />
      <SkeletonText className="h-3 w-3/4" />
    </div>
    <div className="w-12 h-12 rounded-xl shimmer-bg flex-shrink-0"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
      <SkeletonText className="h-4 w-1/4" />
      <SkeletonText className="h-4 w-1/4" />
      <SkeletonText className="h-4 w-1/4" />
      <SkeletonText className="h-4 w-1/4" />
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 flex gap-4 items-center">
          <SkeletonText className="h-4 w-1/4" />
          <SkeletonText className="h-4 w-1/4" />
          <SkeletonText className="h-4 w-1/4" />
          <div className="w-1/4 flex gap-2 justify-end">
            <SkeletonButton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
    <SkeletonText className="h-5 w-1/4" />
    <div className="h-[200px] flex items-end gap-3 pt-6 px-4">
      <div className="w-full shimmer-bg rounded-t-lg h-[40%]"></div>
      <div className="w-full shimmer-bg rounded-t-lg h-[75%]"></div>
      <div className="w-full shimmer-bg rounded-t-lg h-[50%]"></div>
      <div className="w-full shimmer-bg rounded-t-lg h-[90%]"></div>
      <div className="w-full shimmer-bg rounded-t-lg h-[60%]"></div>
    </div>
  </div>
);

export const SkeletonChatBubble = () => (
  <div className="flex gap-3 justify-start items-start">
    <SkeletonAvatar className="w-8 h-8 flex-shrink-0" />
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-sm shadow-sm space-y-2 max-w-[80%] flex-1">
      <SkeletonText className="h-4 w-5/6" />
      <SkeletonText className="h-4 w-3/4" />
      <SkeletonText className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-6">
    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
      <SkeletonAvatar className="w-24 h-24" />
      <div className="space-y-2 flex-1 text-center sm:text-left">
        <SkeletonText className="h-6 w-1/3 mx-auto sm:mx-0" />
        <SkeletonText className="h-4 w-1/4 mx-auto sm:mx-0" />
        <SkeletonText className="h-4 w-1/2 mx-auto sm:mx-0" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <SkeletonText className="h-4 w-1/4" />
        <SkeletonText className="h-10 w-full" />
      </div>
      <div className="space-y-3">
        <SkeletonText className="h-4 w-1/4" />
        <SkeletonText className="h-10 w-full" />
      </div>
    </div>
  </div>
);
