/**
 * Formatting utilities for displaying data in the InfoPanel and other components
 */

/**
 * Format year as a string
 * @param year - The year number
 * @returns Formatted year string (e.g., "2017")
 */
export function formatYear(year: number): string {
  return year.toString();
}

/**
 * Format capability level to human-readable text
 * @param level - The capability level ('continent', 'archipelago', 'island', 'strait')
 * @returns Human-readable level description
 */
export function formatCapabilityLevel(level: string): string {
  const levelMap: Record<string, string> = {
    continent: 'Continent',
    archipelago: 'Archipelago',
    island: 'Island',
    strait: 'Strait',
  };
  return levelMap[level] || level;
}

/**
 * Format landmark type to human-readable text
 * @param type - The landmark type ('paper', 'model', 'tool', 'benchmark')
 * @returns Human-readable type description
 */
export function formatLandmarkType(type: string): string {
  const typeMap: Record<string, string> = {
    paper: 'Research Paper',
    model: 'Foundation Model',
    tool: 'Tool',
    benchmark: 'Benchmark',
  };
  return typeMap[type] || type;
}

/**
 * Get badge color for landmark type
 * @param type - The landmark type
 * @returns Tailwind color class
 */
export function getLandmarkTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    paper: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    model: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    tool: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    benchmark: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

/**
 * Get badge color for capability level
 * @param level - The capability level
 * @returns Tailwind color class
 */
export function getCapabilityLevelColor(level: string): string {
  const colorMap: Record<string, string> = {
    continent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    archipelago: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    island: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    strait: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  };
  return colorMap[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

/**
 * Get icon for landmark type
 * @param type - The landmark type
 * @returns Icon name or emoji
 */
export function getLandmarkTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    paper: '📄',
    model: '🤖',
    tool: '🔧',
    benchmark: '📊',
  };
  return iconMap[type] || '📌';
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 150)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trimEnd() + '...';
}

/**
 * Format comma-separated text as an array of tags
 * @param text - Comma-separated text
 * @returns Array of trimmed tags
 */
export function parseTagsFromText(text: string): string[] {
  if (!text) return [];
  return text
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Format date to ISO format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "October 20, 2025")
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

/**
 * Get shortened organization name
 * @param org - Full organization name
 * @returns Shortened name (e.g., "Google Brain" → "GB")
 */
export function getOrgInitials(org: string): string {
  return org
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
}
