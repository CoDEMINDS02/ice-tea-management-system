import type { TeamMember } from "@/types/team";

/** Demo staff. All names and emails are fake. */
export function createDemoTeam(): TeamMember[] {
  return [
    {
      id: "team-1",
      name: "Hamza Qureshi",
      email: "hamza@icedteahouse.example",
      role: "owner",
      isActive: true,
      joinedOn: "2026-01-10",
    },
    {
      id: "team-2",
      name: "Sana Mirza",
      email: "sana@icedteahouse.example",
      role: "manager",
      isActive: true,
      joinedOn: "2026-02-03",
    },
    {
      id: "team-3",
      name: "Rida Anwar",
      email: "rida@icedteahouse.example",
      role: "cashier",
      isActive: true,
      joinedOn: "2026-03-15",
    },
    {
      id: "team-4",
      name: "Danish Farooq",
      email: "danish@icedteahouse.example",
      role: "kitchen",
      isActive: true,
      joinedOn: "2026-04-01",
    },
    {
      id: "team-5",
      name: "Kashif Javed",
      email: "kashif@icedteahouse.example",
      role: "delivery",
      isActive: true,
      joinedOn: "2026-05-20",
    },
    {
      id: "team-6",
      name: "Mehwish Tariq",
      email: "mehwish@icedteahouse.example",
      role: "cashier",
      isActive: false,
      joinedOn: "2026-06-08",
    },
  ];
}
