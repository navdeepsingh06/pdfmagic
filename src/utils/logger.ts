const isDev = true // Always log in dev for now

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log('[PDF Merge]', ...args)
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error('[PDF Merge Error]', ...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[PDF Merge Warn]', ...args)
  },
}
