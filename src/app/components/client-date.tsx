'use client';

import { useState, useEffect } from 'react';
import { format, type FormatOptions } from 'date-fns';

interface ClientDateProps {
  date: Date | string | number;
  format: string;
  options?: FormatOptions;
  fallback?: React.ReactNode;
}

export function ClientDate({ date, format: formatStr, options, fallback = null }: ClientDateProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback;
  }

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  try {
    return <>{format(dateObj, formatStr, options)}</>;
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
}
