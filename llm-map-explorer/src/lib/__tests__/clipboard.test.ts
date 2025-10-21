import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { copyToClipboard, getCurrentUrl, copyCurrentUrlToClipboard } from '@/lib/clipboard';

describe('Clipboard Utilities', () => {
  // Mock document.execCommand
  const execCommandMock = vi.fn();
  const originalExecCommand = document.execCommand;

  beforeEach(() => {
    document.execCommand = execCommandMock;
    execCommandMock.mockReturnValue(true);
  });

  afterEach(() => {
    document.execCommand = originalExecCommand;
    vi.clearAllMocks();
  });

  describe('copyToClipboard', () => {
    it('should use Clipboard API if available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      await copyToClipboard('test text');

      expect(writeTextMock).toHaveBeenCalledWith('test text');
    });

    it('should fallback to execCommand if Clipboard API is not available', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });

      await copyToClipboard('test text');

      expect(execCommandMock).toHaveBeenCalledWith('copy');
    });

    it('should handle Clipboard API rejection with fallback', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      await copyToClipboard('test text');

      expect(writeTextMock).toHaveBeenCalledWith('test text');
      expect(execCommandMock).toHaveBeenCalledWith('copy');
    });

    it('should throw error if both Clipboard API and fallback fail', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });
      execCommandMock.mockReturnValue(false);

      await expect(copyToClipboard('test text')).rejects.toThrow();
    });

    it('should throw error if window is not defined', async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      try {
        await expect(copyToClipboard('test')).rejects.toThrow();
      } finally {
        global.window = originalWindow;
      }
    });

    it('should create and remove textarea element for fallback', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });

      const appendChildMock = vi.spyOn(document.body, 'appendChild');
      const removeChildMock = vi.spyOn(document.body, 'removeChild');

      await copyToClipboard('test text');

      expect(appendChildMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalled();

      appendChildMock.mockRestore();
      removeChildMock.mockRestore();
    });

    it('should handle multiple consecutive copies', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      await copyToClipboard('text 1');
      await copyToClipboard('text 2');
      await copyToClipboard('text 3');

      expect(writeTextMock).toHaveBeenCalledTimes(3);
      expect(writeTextMock).toHaveBeenNthCalledWith(1, 'text 1');
      expect(writeTextMock).toHaveBeenNthCalledWith(2, 'text 2');
      expect(writeTextMock).toHaveBeenNthCalledWith(3, 'text 3');
    });

    it('should handle special characters in text', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      const specialText = 'Hello\nWorld\t123!@#$%^&*()';
      await copyToClipboard(specialText);

      expect(writeTextMock).toHaveBeenCalledWith(specialText);
    });

    it('should handle very long text', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      const longText = 'a'.repeat(10000);
      await copyToClipboard(longText);

      expect(writeTextMock).toHaveBeenCalledWith(longText);
    });

    it('should handle empty string', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      await copyToClipboard('');

      expect(writeTextMock).toHaveBeenCalledWith('');
    });

    it('should handle URLs with query parameters', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      const url = 'http://localhost:3000/?lat=50&lng=100&zoom=2&entity=lm-001&entityType=landmark';
      await copyToClipboard(url);

      expect(writeTextMock).toHaveBeenCalledWith(url);
    });
  });

  describe('getCurrentUrl', () => {
    it('should return the current page URL', () => {
      const url = getCurrentUrl();
      expect(url).toBe(window.location.href);
    });

    it('should include query parameters', () => {
      // Mock window.location.href with query params
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/?lat=50&lng=100',
          protocol: 'http:',
          host: 'localhost:3000',
          pathname: '/',
          search: '?lat=50&lng=100',
          hash: '',
          origin: 'http://localhost:3000',
        },
        writable: true,
      });

      const url = getCurrentUrl();
      expect(url).toContain('lat=50');
      expect(url).toContain('lng=100');
    });

    it('should throw error if window is not defined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      try {
        expect(() => getCurrentUrl()).toThrow();
      } finally {
        global.window = originalWindow;
      }
    });
  });

  describe('copyCurrentUrlToClipboard', () => {
    it('should copy current URL to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      const url = await copyCurrentUrlToClipboard();

      expect(url).toBe(window.location.href);
      expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
    });

    it('should return the URL that was copied', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      const result = await copyCurrentUrlToClipboard();

      expect(result).toBe(window.location.href);
    });

    it('should throw error if copy fails', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });
      execCommandMock.mockReturnValue(false);

      await expect(copyCurrentUrlToClipboard()).rejects.toThrow();
    });
  });

  describe('Textarea cleanup', () => {
    it('should remove textarea even if select or execCommand throws', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });

      const selectError = new Error('Select failed');
      HTMLTextAreaElement.prototype.select = vi.fn().mockImplementation(() => {
        throw selectError;
      });

      const removeChildMock = vi.spyOn(document.body, 'removeChild');

      try {
        await copyToClipboard('test');
      } catch (e) {
        // Expected to throw
      }

      expect(removeChildMock).toHaveBeenCalled();
      removeChildMock.mockRestore();
    });
  });
});
