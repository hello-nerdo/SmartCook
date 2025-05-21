import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generic fetcher function for SWR
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// Photo-specific SWR config with 60-minute cache (matching signed URL expiration)
export const photoSWRConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 3600000, // 60 minutes
  refreshInterval: 3600000, // 60 minutes
}; 