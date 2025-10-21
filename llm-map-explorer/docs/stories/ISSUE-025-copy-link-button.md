# Issue #25: "Copy Link" Button

**Sprint:** Sprint 4 (Week 7-8)

**Story Points:** 2

**Priority:** P2

**Labels:** sharing, UI

**Dependencies:** #24

**Reference:** [prd.md Section 6.11](../prd.md)

---

## Title

Add "Copy Link" button to header

---

## Description

Enable users to copy current map view URL to clipboard with a single click. Users can easily share the exact map view (position, zoom, selected entity, highlights) with others via a copied link.

---

## Acceptance Criteria

- [ ] "Copy Link" button added to header (with share icon)
- [ ] Button copies current URL to clipboard
- [ ] Toast notification displays: "Link copied to clipboard"
- [ ] Button accessible: keyboard accessible, aria-label
- [ ] Works across browsers (Clipboard API with fallback)
- [ ] Unit test verifies clipboard write
- [ ] E2E test verifies user flow

---

## Technical Details

### Button Component

```typescript
// In header component
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Share2 } from 'lucide-react';

export function HeaderCopyLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;

      // Try Clipboard API first (modern browsers)
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        copyToClipboardFallback(url);
      }

      // Show confirmation
      setIsCopied(true);
      toast({
        title: 'Link Copied',
        description: 'Map view URL copied to clipboard',
        duration: 2000
      });

      // Reset button state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
        duration: 2000
      });
    }
  };

  return (
    <Button
      onClick={handleCopyLink}
      variant="ghost"
      size="sm"
      aria-label="Copy current map view URL to clipboard"
      className={cn(isCopied && 'bg-accent text-accent-foreground')}
    >
      <Share2 className="h-4 w-4" />
      {isCopied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
}
```

### Clipboard Fallback

```typescript
// For older browsers without Clipboard API
function copyToClipboardFallback(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);

  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}
```

---

## Button Styling

### Default State

```css
.copy-link-button {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 200ms ease-out;
  background-color: transparent;
  color: var(--foreground);
}

.copy-link-button:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.copy-link-button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Active State (After Copy)

```css
.copy-link-button.copied {
  background-color: var(--green-500);
  color: white;
}

.copy-link-button.copied:after {
  content: '✓';
  margin-left: 4px;
}
```

---

## Header Placement

### Header Layout

```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] Terra Incognita Linguae  [SearchBar]  [Copy Link] [...]│
└────────────────────────────────────────────────────────────────┘
                                                      ↑
                                              Copy Link Button
```

### Component Position

- Located in header, right side
- Next to other action buttons (settings, menu, etc.)
- Accessible via keyboard Tab navigation
- Share icon (lucide-react: Share2) provides visual cue

---

## User Flow

### Step 1: User is viewing map

```
User has navigated to interesting map view:
- Zoomed to a particular region
- Selected a landmark or capability
- Highlighted an organization
```

### Step 2: User clicks "Copy Link" button

```
User clicks button with Share2 icon
Button state changes: "Copy Link" → "Copied!"
Button background color changes (visual feedback)
Toast notification appears: "Link copied to clipboard"
```

### Step 3: User shares URL

```
User pastes URL in chat/email/social media
Friend/colleague receives URL
Friend opens URL in browser
→ Map state restored exactly as original user left it
```

---

## Clipboard API Considerations

### Modern Approach

```typescript
// Clipboard API (modern)
await navigator.clipboard.writeText(url);
```

Advantages:
- Async operation
- Secure (only works with HTTPS or localhost)
- Cleaner code
- No visual element injection

### Fallback Approach

```typescript
// document.execCommand fallback (older browsers)
const textarea = document.createElement('textarea');
textarea.value = url;
document.body.appendChild(textarea);
textarea.select();
document.execCommand('copy');
document.body.removeChild(textarea);
```

Advantages:
- Works in older browsers (IE 11+)
- Synchronous operation
- Workaround for mixed HTTP/HTTPS scenarios

---

## Toast Notification

### Success Toast

```
┌─────────────────────────────────┐
│ Link Copied                     │
│ Map view URL copied to          │
│ clipboard                       │
│                          [✕]    │
└─────────────────────────────────┘
```

### Error Toast

```
┌─────────────────────────────────┐
│ Error                           │
│ Failed to copy link             │
│                          [✕]    │
└─────────────────────────────────┘
```

---

## Accessibility Requirements

- Button keyboard accessible (Tab navigation)
- Descriptive aria-label: "Copy current map view URL to clipboard"
- Focus state clearly visible (outline)
- Visual feedback on click (button state changes)
- Toast notification readable by screen reader
- Icon accompanied by text (not icon-only)

---

## Testing Requirements

### Unit Tests

- Test button renders with correct initial state
- Test button click triggers clipboard write
- Test success toast displays
- Test error toast displays on clipboard error
- Test button state changes to "Copied!"
- Test button state reverts after 2 seconds
- Test fallback clipboard function works
- Test keyboard accessibility (Tab, Space/Enter)

### Integration Tests

- Test Clipboard API permission handling
- Test URL is complete (includes all query params)
- Test works with all query parameter combinations
- Test toast system integration

### E2E Tests

- Click "Copy Link" button
- Verify button text changes to "Copied!"
- Verify toast notification appears
- Verify URL in clipboard matches current page
- Open clipboard URL in new tab/browser
- Verify map state restored exactly
- Test on different browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile browsers

### Cross-Browser Testing

| Browser | Status | Notes |
|---|---|---|
| Chrome 90+ | ✓ Full | Clipboard API supported |
| Firefox 87+ | ✓ Full | Clipboard API supported |
| Safari 13.1+ | ✓ Full | Clipboard API supported |
| Edge 90+ | ✓ Full | Clipboard API supported |
| IE 11 | ⚠ Fallback | Uses document.execCommand |

---

## Performance Considerations

- Button click is instant (< 50ms)
- Clipboard write typically < 100ms
- No network requests
- No impact on map performance

---

## Security Considerations

- Clipboard API requires HTTPS (or localhost)
- No sensitive data in URL (public reference IDs only)
- URL is same as user's current page URL
- No token or authentication data included

---

## Browser Compatibility

### Clipboard API Support

- Chrome 63+
- Firefox 53+
- Safari 13.1+
- Edge 79+
- Mobile browsers: Recent versions

### Fallback

- IE 11 uses document.execCommand('copy')
- Old Safari versions use fallback
- Graceful degradation - always works somehow

---

## Configuration

### Toast Duration

```typescript
duration: 2000  // 2 seconds before toast auto-closes
```

### Button State Reset

```typescript
setTimeout(() => setIsCopied(false), 2000);  // Reset after 2 seconds
```

### Toast Messages

```typescript
Success: 'Link copied to clipboard'
Error: 'Failed to copy link'
```

---

## Icon Selection

Using lucide-react `Share2` icon:

```
     ↙ ↖
    ┌──┐
    │  │
    └──┘
     ↘ ↗
```

- Commonly recognized as "share" action
- Clear meaning to users
- Works well at small sizes

---

## Dependencies

- Depends on: Issue #24 (URL state encoding)
- Requires: Toast/notification system (shadcn/ui)
- Works with: Header component
- Needs: Lucide-react icon library

---

## Integration Notes

- Button placed in header navigation
- Uses Zustand store (no additional state needed)
- URL built from current window.location.href
- Toast system must be initialized in app layout
- No server-side dependencies

---

## Keyboard Shortcuts

Consider adding:
- `Cmd+K` or `Ctrl+K` to open copy dialog (future enhancement)
- Currently uses standard Tab navigation

---

## Mobile Considerations

- Button works on mobile browsers
- Clipboard API works on modern mobile browsers
- Fallback works on older mobile browsers
- Consider touch target size: minimum 44px × 44px

---

## Notes

- Keep button simple and discoverable
- Icon + text is better than icon-only for accessibility
- 2-second "Copied!" state provides good feedback
- Toast notification confirms action was successful
- Consider adding keyboard shortcut in future version
- URL generation is instant, no loading state needed
