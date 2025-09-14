const LoadingSkeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50">
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;