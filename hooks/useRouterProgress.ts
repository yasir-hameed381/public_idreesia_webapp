'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { useRouter } from 'next/navigation';

export function useRouterProgress() {
  const router = useRouter();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({
      showSpinner: false,  // Hide the spinner, only show the top bar
      trickleSpeed: 200,
      minimum: 0.08,
    });

    // Store the original push function
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;

    // Override router methods to show progress
    router.push = (...args: Parameters<typeof originalPush>) => {
      NProgress.start();
      return originalPush.apply(router, args);
    };

    router.replace = (...args: Parameters<typeof originalReplace>) => {
      NProgress.start();
      return originalReplace.apply(router, args);
    };

    router.back = () => {
      NProgress.start();
      return originalBack.apply(router);
    };

    // Cleanup
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
    };
  }, [router]);
}

