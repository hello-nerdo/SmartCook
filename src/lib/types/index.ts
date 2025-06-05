export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Cloudflare Images API types
export interface CloudflareImageResponse {
  result: CloudflareImageResult;
  success: boolean;
  errors: string[];
  messages: string[];
}

export interface CloudflareImageResult {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}
