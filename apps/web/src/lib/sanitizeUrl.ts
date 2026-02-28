/**
 * Ensures a URL only uses safe protocols before rendering in an <a> href.
 * Blocks javascript:, data:, file:, vbscript: and anything unexpected.
 * Returns null if unsafe — caller should render as plain text instead.
 */
const SAFE = /^(https?:\/\/|mailto:)/i

export function sanitizeUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string') return null
    return SAFE.test(url.trim()) ? url.trim() : null
}