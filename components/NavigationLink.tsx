'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Custom Link component that triggers NProgress loading bar
 * Use this for all navigation links to show loading feedback
 */
export default function NavigationLink({ 
  href, 
  children, 
  onClick,
  className 
}: NavigationLinkProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Complete progress when pathname changes
    NProgress.done();
  }, [pathname]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't start progress if it's the same page
    const currentPath = pathname.split('?')[0];
    const targetPath = href.split('?')[0];
    
    if (currentPath !== targetPath) {
      NProgress.start();
    }

    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

