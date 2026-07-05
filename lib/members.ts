import { z } from "zod";

export const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
export const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

// Graduation years offered in batch dropdowns, newest first. Range widens automatically.
export function batchYears() {
  const now = new Date().getFullYear();
  return Array.from({ length: 17 }, (_, i) => String(now + 6 - i));
}

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((url) => url.startsWith("https://"), "Use an https:// URL")
  .or(z.literal(""))
  .transform((value) => value || null);

export const profileSchema = z.object({
  displayName: z.string().trim().max(80).optional(),
  college: z.string().trim().max(120).optional(),
  batch: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Select a valid graduation year")
    .or(z.literal(""))
    .optional(),
  branch: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(1200).optional(),
  skills: z.string().trim().max(500).optional(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  leetcodeHandle: z.string().trim().max(80).optional(),
  resumeUrl: optionalUrl,
});

export const badgeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional(),
  xp: z.coerce.number().int().min(0).max(1_000_000).default(0),
});

export type Medal = "gold" | "silver" | "bronze";

export function memberTotalXp(memberBadges: { badge: { xp: number } }[]) {
  return memberBadges.reduce((total, memberBadge) => total + memberBadge.badge.xp, 0);
}

// How many top overall-XP positions earn a medal and a rank-up notification.
export const OVERALL_RANK_TOP_N = 3;

export type RankedMember = { id: string; name: string; xp: number };

// Members with XP ordered best-first, ties broken by name — the single source of
// truth for both medals and overall-rank notifications.
export function rankMembersByXp(members: RankedMember[]): RankedMember[] {
  return members
    .filter((member) => member.xp > 0)
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
}

// Map of userId -> 1-based overall rank (only members with XP appear).
export function overallRankMap(members: RankedMember[]): Map<string, number> {
  return new Map(rankMembersByXp(members).map((member, index) => [member.id, index + 1]));
}

export type OverallRankPromotion = { id: string; name: string; rank: number };

// Members who climbed into (or up within) the top N overall between two snapshots.
// A member counts as promoted when they were previously outside the top N (or had
// no XP) or now hold a strictly better position than before. Drops never notify.
export function overallRankPromotions(
  before: RankedMember[],
  after: RankedMember[],
  topN = OVERALL_RANK_TOP_N,
): OverallRankPromotion[] {
  const beforeRank = overallRankMap(before);

  return rankMembersByXp(after)
    .slice(0, topN)
    .map((member, index) => ({ member, rank: index + 1 }))
    .filter(({ member, rank }) => {
      const previousRank = beforeRank.get(member.id);
      return previousRank === undefined || rank < previousRank;
    })
    .map(({ member, rank }) => ({ id: member.id, name: member.name, rank }));
}

// Global gold/silver/bronze for the top 3 members by XP (XP > 0 only), ties broken by name.
export function assignMedals(members: RankedMember[]): Map<string, Medal> {
  const medals: Medal[] = ["gold", "silver", "bronze"];

  return new Map(
    rankMembersByXp(members)
      .slice(0, 3)
      .map((member, index) => [member.id, medals[index]]),
  );
}

type MedalCandidate = {
  id: string;
  name: string | null;
  email: string;
  profile?: { displayName: string | null } | null;
  memberBadges: { badge: { xp: number } }[];
};

// Build the medal map straight from member records (display name + summed badge XP).
export function medalsForMembers(members: MedalCandidate[]) {
  return assignMedals(
    members.map((member) => ({
      id: member.id,
      name: memberDisplayName(member),
      xp: memberTotalXp(member.memberBadges),
    })),
  );
}

export function parseSkills(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function memberDisplayName(user: {
  name: string | null;
  email: string;
  profile?: { displayName: string | null } | null;
}) {
  return user.profile?.displayName || user.name || "ShardUp member";
}

export function memberInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function validateProfilePhoto(file: File) {
  if (file.size === 0) {
    return null;
  }

  if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
    return "Upload a JPG, PNG, WebP, or SVG image.";
  }

  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    return "Keep profile photos under 2MB.";
  }

  return null;
}
