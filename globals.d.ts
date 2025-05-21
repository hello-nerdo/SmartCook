declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {}
  }
} //extends process.env to have new types given by cloudflare

export type {};
