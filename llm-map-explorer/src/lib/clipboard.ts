/**
 * Clipboard utility functions for copying text to clipboard
 * with support for modern Clipboard API and fallback for older browsers
 */

/**
 * Fallback clipboard copy for older browsers that don't support Clipboard API
 * Uses document.execCommand('copy') which requires a visible selection
 * @param text - Text to copy
 */
function copyToClipboardFallback(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  try {
    textarea.select();
    const successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('execCommand failed');
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 * @param text - Text to copy to clipboard
 * @throws Error if clipboard copy fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    throw new Error('Clipboard API not available');
  }

  try {
    // Try modern Clipboard API first (Chrome 63+, Firefox 53+, Safari 13.1+, Edge 79+)
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for older browsers
    copyToClipboardFallback(text);
    // eslint-disable-next-line no-empty
  } catch {
    // If Clipboard API fails, try fallback
    try {
      copyToClipboardFallback(text);
    } catch (fallbackError) {
      throw new Error(`Failed to copy to clipboard: ${String(fallbackError)}`);
    }
  }
}

/**
 * Get current page URL (for sharing)
 * @returns Full URL of current page with all query parameters
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') {
    throw new Error('window is not defined');
  }
  return window.location.href;
}

/**
 * Copy current page URL to clipboard
 * Combines getCurrentUrl + copyToClipboard
 * @throws Error if URL copy fails
 */
export async function copyCurrentUrlToClipboard(): Promise<string> {
  const url = getCurrentUrl();
  await copyToClipboard(url);
  return url;
}
