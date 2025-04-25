import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { useMemo } from 'react';


/**
 * Returns the current full href including pathname and search params
 * @example "/dashboard?page=1"
 */
export function useFullHref(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    if (!pathname) return '';
    const search = searchParams?.toString() || '';
    return `${pathname}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);
}
