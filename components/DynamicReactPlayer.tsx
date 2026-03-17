/**
 * Lazy-loaded ReactPlayer to reduce initial bundle size
 * Import from this file to avoid pulling in DataGrid/MUI dependencies
 */
import dynamic from "next/dynamic";

export const DynamicReactPlayer = dynamic(
  () => import("react-player").then((mod) => ({ default: mod.default })),
  {
    loading: () => (
      <div className="flex items-center justify-center w-full h-64 bg-gray-200 dark:bg-zinc-800 rounded-lg">
        <p className="text-gray-600 dark:text-zinc-400">
          Loading video player...
        </p>
      </div>
    ),
    ssr: false,
  }
);
