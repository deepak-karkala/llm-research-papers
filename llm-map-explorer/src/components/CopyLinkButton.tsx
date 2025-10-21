/**
 * CopyLinkButton Component
 * Provides a button to copy the current map view URL to clipboard
 * Shows visual feedback and confirmation message
 */

'use client';

import * as React from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyCurrentUrlToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

interface CopyLinkButtonProps {
  className?: string;
}

/**
 * CopyLinkButton - Copies current map view URL to clipboard
 * Features:
 * - Click to copy current URL
 * - Visual feedback (button text changes to "Copied!")
 * - Alert message for accessibility
 * - Keyboard accessible (Tab navigation, Space/Enter to activate)
 * - Cross-browser support (Clipboard API with fallback)
 */
export function CopyLinkButton({ className }: CopyLinkButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyLink = async () => {
    // Prevent multiple clicks while copying
    if (isLoading || isCopied) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Copy URL to clipboard
      const url = await copyCurrentUrlToClipboard();

      // Show success feedback
      setIsCopied(true);

      // Announce to screen readers
      const announcement = `Link copied to clipboard: ${url}`;
      announceToScreenReader(announcement);

      // Reset button state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy link';
      setError(errorMessage);

      // Announce error to screen readers
      announceToScreenReader(`Error: ${errorMessage}`);

      // Clear error after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleCopyLink}
        disabled={isLoading || isCopied}
        variant="ghost"
        size="sm"
        aria-label="Copy current map view URL to clipboard"
        title="Copy link to current map view"
        className={cn(
          'transition-all duration-200',
          isCopied && 'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:text-green-400',
          error && 'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:text-red-400',
          className
        )}
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : error ? (
          <>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Error</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>

      {/* Screen reader announcements region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="copy-link-announcements"
      />
    </>
  );
}

/**
 * Announce a message to screen readers
 * @param message - Message to announce
 */
function announceToScreenReader(message: string) {
  // Create or get the announcements region
  let region = document.getElementById('copy-link-announcements');
  if (!region) {
    region = document.createElement('div');
    region.id = 'copy-link-announcements';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }

  // Clear previous message and announce new one
  region.textContent = '';
  // Use setTimeout to ensure the region is cleared before adding new content
  // This ensures screen readers announce the message even if it's the same as before
  setTimeout(() => {
    region!.textContent = message;
  }, 100);
}
