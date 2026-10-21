import { shopDayOf } from "@/lib/sales-report";
import type { Role, TeamMember } from "@/types/team";

export type NewMemberInput = {
  name: string;
  email: string;
  role: Role;
};

export type NewMemberErrors = {
  name?: string;
  email?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message per invalid field. An empty object means valid. */
export function validateNewMember(
  input: NewMemberInput,
  members: TeamMember[],
): NewMemberErrors {
  const errors: NewMemberErrors = {};
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) {
    errors.name = "Name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (members.some((member) => member.email.toLowerCase() === email)) {
    errors.email = "A team member with this email already exists.";
  }

  return errors;
}

/** Turns valid form input into a new member with the next free id. */
export function buildMember(
  input: NewMemberInput,
  members: TeamMember[],
): TeamMember {
  const highest = members.reduce((max, member) => {
    const number = Number(member.id.replace("team-", ""));

    return Number.isFinite(number) && number > max ? number : max;
  }, 0);

  return {
    id: `team-${highest + 1}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isActive: true,
    joinedOn: shopDayOf(new Date()),
  };
}

/** True if this is the only active owner, who must not be removed or demoted. */
export function isLastActiveOwner(
  members: TeamMember[],
  memberId: string,
): boolean {
  const member = members.find((m) => m.id === memberId);

  if (!member || member.role !== "owner" || !member.isActive) return false;

  return !members.some(
    (other) =>
      other.id !== memberId && other.role === "owner" && other.isActive,
  );
}
