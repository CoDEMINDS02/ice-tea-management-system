"use client";

import { useCallback, useEffect, useState } from "react";

import { createDemoTeam } from "@/data/team";
import { ROLES } from "@/lib/roles";
import { isLastActiveOwner } from "@/lib/team-builder";
import type { Role, TeamMember } from "@/types/team";

/** Change the version suffix if TeamMember changes, so old saves are ignored. */
const STORAGE_KEY = "iced-tea-house:team:v1";

/** Basic shape check so broken or outdated saved data never reaches the UI. */
function isMember(value: unknown): value is TeamMember {
  if (typeof value !== "object" || value === null) return false;

  const member = value as Partial<TeamMember>;

  return (
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    typeof member.email === "string" &&
    typeof member.role === "string" &&
    ROLES.includes(member.role) &&
    typeof member.isActive === "boolean" &&
    typeof member.joinedOn === "string"
  );
}

/** Saved team if it looks valid, otherwise the demo team. */
function loadTeam(): TeamMember[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every(isMember)) {
        return parsed;
      }
    }
  } catch {
    // Storage blocked or data corrupted: fall back to the demo team.
  }

  return createDemoTeam();
}

/**
 * Team members, saved in this browser. `members` is null until the saved
 * data has loaded. Later this can be replaced by calls to the backend.
 */
export function useTeam() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);

  // Load once after the first render, so server and browser HTML match.
  useEffect(() => {
    setMembers(loadTeam());
  }, []);

  // Save every change. Skipped until the first load has finished.
  useEffect(() => {
    if (!members) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {
      // Storage full or blocked: the app keeps working, just without saving.
    }
  }, [members]);

  const addMember = useCallback((member: TeamMember) => {
    setMembers((current) => (current ? [...current, member] : current));
  }, []);

  const changeRole = useCallback((memberId: string, role: Role) => {
    setMembers((current) => {
      if (!current) return current;

      // The last active owner must stay an owner.
      if (role !== "owner" && isLastActiveOwner(current, memberId)) {
        return current;
      }

      return current.map((member) =>
        member.id === memberId ? { ...member, role } : member,
      );
    });
  }, []);

  const setActive = useCallback((memberId: string, isActive: boolean) => {
    setMembers((current) => {
      if (!current) return current;

      // The last active owner must stay active.
      if (!isActive && isLastActiveOwner(current, memberId)) {
        return current;
      }

      return current.map((member) =>
        member.id === memberId ? { ...member, isActive } : member,
      );
    });
  }, []);

  return { members, addMember, changeRole, setActive };
}
