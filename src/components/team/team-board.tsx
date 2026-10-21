"use client";

import { useState, type SyntheticEvent } from "react";
import { Check, Minus, UserPlus } from "lucide-react";

import { useTeam } from "@/hooks/use-team";
import { formatDayLabel } from "@/lib/format";
import {
  AREA_LABELS,
  PERMISSION_AREAS,
  ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  hasPermission,
} from "@/lib/roles";
import {
  buildMember,
  isLastActiveOwner,
  validateNewMember,
  type NewMemberErrors,
} from "@/lib/team-builder";
import type { Role } from "@/types/team";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

export function TeamBoard() {
  const { members, addMember, changeRole, setActive } = useTeam();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [errors, setErrors] = useState<NewMemberErrors>({});

  if (!members) {
    return <p className="text-sm text-neutral-500">Loading team...</p>;
  }

  const activeCount = members.filter((member) => member.isActive).length;

  function closeForm() {
    setShowForm(false);
    setName("");
    setEmail("");
    setRole("cashier");
    setErrors({});
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!members) return;

    const input = { name, email, role };
    const foundErrors = validateNewMember(input, members);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    addMember(buildMember(input, members));
    closeForm();
  }

  return (
    <div className="space-y-6">
      {/* Members */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Team members ({members.length})
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              {activeCount} active, {members.length - activeCount} inactive
            </p>
          </div>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Add member
            </button>
          ) : null}
        </div>

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-4 grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-3"
          >
            <div>
              <label
                htmlFor="memberName"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>
              <input
                id="memberName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "memberName-error" : undefined}
                className={inputClass}
              />
              <FieldError id="memberName-error" message={errors.name} />
            </div>

            <div>
              <label
                htmlFor="memberEmail"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Email
              </label>
              <input
                id="memberEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "memberEmail-error" : undefined
                }
                className={inputClass}
              />
              <FieldError id="memberEmail-error" message={errors.email} />
            </div>

            <div>
              <label
                htmlFor="memberRole"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Role
              </label>
              <select
                id="memberRole"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={inputClass}
              >
                {ROLES.map((value) => (
                  <option key={value} value={value}>
                    {ROLE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Add member
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Member</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Joined</th>
                <th className="pb-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {members.map((member) => {
                const locked = isLastActiveOwner(members, member.id);

                return (
                  <tr
                    key={member.id}
                    className={member.isActive ? "" : "bg-neutral-50"}
                  >
                    <td className="py-3 pr-4">
                      <p
                        className={`font-medium ${
                          member.isActive
                            ? "text-neutral-900"
                            : "text-neutral-500"
                        }`}
                      >
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500">{member.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          changeRole(member.id, e.target.value as Role)
                        }
                        disabled={locked}
                        aria-label={`Role for ${member.name}`}
                        title={
                          locked
                            ? "The last active owner cannot be changed."
                            : undefined
                        }
                        className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                      >
                        {ROLES.map((value) => (
                          <option key={value} value={value}>
                            {ROLE_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.isActive
                            ? "bg-brand-50 text-brand-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-neutral-500">
                      {formatDayLabel(member.joinedOn)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActive(member.id, !member.isActive)}
                        disabled={locked}
                        title={
                          locked
                            ? "The last active owner cannot be deactivated."
                            : undefined
                        }
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          member.isActive
                            ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "border-brand-600 bg-white text-brand-700 hover:bg-brand-50"
                        }`}
                      >
                        {member.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Members are never deleted, only deactivated. At least one active owner
          is always kept.
        </p>
      </section>

      {/* Permissions */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">
          Roles and permissions
        </h3>
        <p className="mt-0.5 text-xs text-neutral-500">
          What each role is meant to open. Not enforced in this demo yet.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Area</th>
                {ROLES.map((value) => (
                  <th key={value} className="pb-2 px-2 text-center font-medium">
                    {ROLE_LABELS[value]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {PERMISSION_AREAS.map((area) => (
                <tr key={area}>
                  <td className="py-2.5 pr-4 text-neutral-700">
                    {AREA_LABELS[area]}
                  </td>
                  {ROLES.map((value) => {
                    const allowed = hasPermission(value, area);

                    return (
                      <td key={value} className="px-2 py-2.5 text-center">
                        {allowed ? (
                          <Check
                            className="mx-auto h-4 w-4 text-brand-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <Minus
                            className="mx-auto h-4 w-4 text-neutral-300"
                            aria-hidden="true"
                          />
                        )}
                        <span className="sr-only">
                          {allowed ? "Allowed" : "Not allowed"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {ROLES.map((value) => (
            <div key={value} className="text-sm">
              <dt className="font-medium text-neutral-900">
                {ROLE_LABELS[value]}
              </dt>
              <dd className="text-neutral-500">{ROLE_DESCRIPTIONS[value]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-xs text-neutral-400">
        Demo only. Team members are sample data saved in this browser. There is
        no real login, and roles do not restrict any page yet.
      </p>
    </div>
  );
}
