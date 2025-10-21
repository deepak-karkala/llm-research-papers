import type { Landmark, Organization } from '@/types/data';

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

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

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

export function organizationMatchesLandmark(organization: Organization, landmark: Landmark): boolean {
  return matchesById(organization, landmark) || matchesByName(organization, landmark);
}

export function getOrganizationLandmarks(organization: Organization, landmarks: Landmark[]): Landmark[] {
  return landmarks.filter((landmark) => organizationMatchesLandmark(organization, landmark));
}

export function findOrganizationForLandmark(
  organizations: Organization[],
  landmark: Landmark
): Organization | null {
  return organizations.find((organization) => organizationMatchesLandmark(organization, landmark)) ?? null;
}
