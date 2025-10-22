import type { Landmark, Organization } from '@/types/data';

/**
 * Common words to ignore when matching organization names with landmarks
 * Helps reduce false positives in fuzzy matching
 */
const STOP_WORDS = new Set([
  'ai',
  'research',
  'lab',
  'labs',
  'team',
  'university',
  'institute',
  'various',
  'center',
  'centre',
  'company',
  'technologies',
  'technology',
]);

/**
 * Normalize a string by trimming whitespace and converting to lowercase
 * @param value - The string to normalize
 * @returns Normalized string
 */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Tokenize a string into meaningful words by removing stop words
 * @param value - The string to tokenize
 * @returns Array of tokens (words with > 2 characters, excluding stop words)
 */
function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Check if an organization matches a landmark by explicit ID mapping
 * Supports both current landmark-* and legacy lm-* ID formats
 * @param organization - The organization to check
 * @param landmark - The landmark to match
 * @returns True if organization's landmarkIds includes landmark's ID
 */
function matchesById(organization: Organization, landmark: Landmark): boolean {
  if (!organization.landmarkIds) {
    return false;
  }
  const directMatch = organization.landmarkIds.includes(landmark.id);
  if (directMatch) {
    return true;
  }
  const legacyId = landmark.id.replace(/^landmark-/, 'lm-');
  return organization.landmarkIds.includes(legacyId);
}

/**
 * Check if an organization matches a landmark by name similarity
 * Uses token-based fuzzy matching to handle variations in organization names
 * @param organization - The organization to check
 * @param landmark - The landmark with organization name field
 * @returns True if organization name matches landmark's organization field
 */
function matchesByName(organization: Organization, landmark: Landmark): boolean {
  const orgName = normalize(organization.name);
  const landmarkOrg = normalize(landmark.organization ?? '');
  if (!landmarkOrg) {
    return false;
  }
  if (orgName === landmarkOrg) {
    return true;
  }

  const orgTokens = tokenize(organization.name);
  const landmarkTokens = tokenize(landmark.organization ?? '');
  if (orgTokens.length === 0 || landmarkTokens.length === 0) {
    return false;
  }
  return orgTokens.some((token) => landmarkTokens.includes(token));
}

/**
 * Determine if an organization is associated with a landmark
 * Checks both explicit ID mapping and fuzzy name matching
 *
 * @param organization - The organization to check
 * @param landmark - The landmark to match
 * @returns True if organization is associated with landmark
 *
 * @example
 * const matches = organizationMatchesLandmark(openai, transformerPaper);
 */
export function organizationMatchesLandmark(organization: Organization, landmark: Landmark): boolean {
  return matchesById(organization, landmark) || matchesByName(organization, landmark);
}

/**
 * Get all landmarks associated with a specific organization
 *
 * @param organization - The organization to find landmarks for
 * @param landmarks - Array of all available landmarks
 * @returns Array of landmarks associated with the organization
 *
 * @example
 * const openaiLandmarks = getOrganizationLandmarks(openai, allLandmarks);
 */
export function getOrganizationLandmarks(organization: Organization, landmarks: Landmark[]): Landmark[] {
  return landmarks.filter((landmark) => organizationMatchesLandmark(organization, landmark));
}

/**
 * Find the organization that a landmark belongs to
 *
 * @param organizations - Array of all available organizations
 * @param landmark - The landmark to find organization for
 * @returns The matching organization, or null if no match found
 *
 * @example
 * const org = findOrganizationForLandmark(allOrganizations, transformerPaper);
 */
export function findOrganizationForLandmark(
  organizations: Organization[],
  landmark: Landmark
): Organization | null {
  return organizations.find((organization) => organizationMatchesLandmark(organization, landmark)) ?? null;
}
