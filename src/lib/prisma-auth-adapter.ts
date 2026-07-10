import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "@auth/core/adapters";
import type { PrismaClient } from "@prisma/client";
import { emailToTeamSlug, generateSlug } from "@/lib/utils";

async function resolveUniqueTeamSlug(
  prisma: PrismaClient,
  email: string
): Promise<string> {
  let teamSlug = emailToTeamSlug(email);
  const existing = await prisma.user.findUnique({ where: { teamSlug } });
  if (existing) {
    teamSlug = `${teamSlug}-${generateSlug(4)}`;
  }
  return teamSlug;
}

/** PrismaAdapter + OAuth 初回登録時に必須の teamSlug を付与 */
export function calendarAppPrismaAdapter(
  prisma: PrismaClient | ReturnType<PrismaClient["$extends"]>
): Adapter {
  const p = prisma as PrismaClient;
  const base = PrismaAdapter(p);

  return {
    ...base,
    async createUser(user) {
      const email = user.email;
      if (!email) {
        throw new Error("OAuth user must have an email");
      }

      const teamSlug = await resolveUniqueTeamSlug(p, email);
      const created = await p.user.create({
        data: {
          name: user.name ?? undefined,
          email: user.email,
          emailVerified: user.emailVerified ?? undefined,
          image: user.image ?? undefined,
          teamSlug,
        },
      });

      return created as AdapterUser;
    },
  };
}
