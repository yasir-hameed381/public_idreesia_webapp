/**
 * Dynamic imports for heavy components to reduce initial bundle size
 * These components will be loaded only when needed
 */

import dynamic from "next/dynamic";
import {
  ComponentSkeleton,
  CardSkeleton,
  TableSkeleton,
} from "./GlobalLoading";

// Data Grid components (heavy - loads only when needed)
export const DynamicDataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => ({ default: mod.DataGrid })),
  {
    loading: () => <TableSkeleton rows={10} />,
    ssr: false,
  }
);

// Note: jsPDF and XLSX are libraries, not React components
// They should be imported directly when needed, not via dynamic()
// export const DynamicJsPDF = ...
// export const DynamicXLSX = ...

// Date picker (can be lazy loaded)
// Note: Commented out due to type incompatibilities
// Use direct import when needed
// export const DynamicDatePicker = dynamic(() => import('react-datepicker'), { ssr: false });

// Video player (heavy)
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

// MUI components that are heavy
export const DynamicAutocomplete = dynamic(
  () =>
    import("@mui/material/Autocomplete").then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false,
  }
);

// Editor components if you have any
export const DynamicRichTextEditor = dynamic(
  () => import("@mui/material").then((mod) => ({ default: mod.TextField })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false,
  }
);

// Chart components if you add them later
export const DynamicChart = dynamic(
  () => import("@mui/material").then((mod) => ({ default: mod.Box })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);
