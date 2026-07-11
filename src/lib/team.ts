import { prisma } from "@/lib/prisma";
import { emailToTeamSlug, generateSlug, isReservedSlug } from "@/lib/utils";
import type { Team, TeamMember } from "@prisma/client";
import { randomBytes } from "crypto";
import { cache } from "react";

export type TeamWithMembership = Team & {
  members: TeamMember[];
};

export type TeamListItem = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "member";
};

export type TeamMemberListItem = {
  id: string;
  userId: string;
  role: "owner" | "member";
  name: string | null;
  email: string;
  image: string | null;
  joinedAt: string;
};

export function defaultTeamName(userName: string | null | undefined, email: string): string {
  const base = userName?.trim() || email.split("@")[0] || "マイ";
  return `${base}のチーム`;
}

export function normalizeTeamSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateTeamSlugFormat(slug: string): string | null {
  if (slug.length < 3 || slug.length > 40) {
    return "チームIDは3〜40文字で入力してください";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "チームIDは半角英数字とハイフンのみ使えます";
  }
  if (isReservedSlug(slug)) {
    return "このチームIDは使用できません";
  }
  return null;
}

async function resolveUniqueTeamSlug(preferred: string): Promise<string> {
  let slug = normalizeTeamSlug(preferred) || generateSlug(8);
  if (isReservedSlug(slug) || slug.length < 3) {
    slug = generateSlug(8);
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug.slice(0, 20)}-${generateSlug(4)}`;
    const [teamConflict, userConflict] = await Promise.all([
      prisma.team.findUnique({ where: { slug: candidate }, select: { id: true } }),
      prisma.user.findUnique({ where: { teamSlug: candidate }, select: { id: true } }),
    ]);
    if (!teamConflict && !userConflict) return candidate;
  }

  return `${generateSlug(8)}-${generateSlug(4)}`;
}

/** ユーザーの個人チームを作成（owner メンバー付き） */
export async function createPersonalTeamForUser(user: {
  id: string;
  name: string | null;
  email: string;
  teamSlug: string;
}): Promise<Team> {
  const slug = await resolveUniqueTeamSlug(user.teamSlug || emailToTeamSlug(user.email));
  const name = defaultTeamName(user.name, user.email);

  const team = await prisma.$transaction(async (tx) => {
    if (slug !== user.teamSlug) {
      await tx.user.update({
        where: { id: user.id },
        data: { teamSlug: slug },
      });
    }

    const created = await tx.team.create({
      data: {
        name,
        slug,
        ownerUserId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { currentTeamId: created.id },
    });

    return created;
  });

  return team;
}

/**
 * 個人チームが無ければ作成して返す。
 * 既存ユーザー移行・ページ表示時の安全ネット。
 */
export async function ensurePersonalTeam(userId: string): Promise<TeamWithMembership> {
  const existing = await prisma.team.findFirst({
    where: { ownerUserId: userId },
    include: { members: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, teamSlug: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  await createPersonalTeamForUser(user);

  const team = await prisma.team.findFirst({
    where: { ownerUserId: userId },
    include: { members: true },
    orderBy: { createdAt: "asc" },
  });
  if (!team) {
    throw new Error("Failed to create personal team");
  }
  return team;
}

/** 所属チーム一覧（作成日時昇順） */
export async function listTeamsForUser(userId: string): Promise<TeamListItem[]> {
  await ensurePersonalTeam(userId);

  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: { select: { id: true, name: true, slug: true, createdAt: true } },
    },
    orderBy: { team: { createdAt: "asc" } },
  });

  return memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    slug: m.team.slug,
    role: m.role,
  }));
}

/**
 * 現在選択中のチームを返す。未設定・無効なら個人チームにフォールバック。
 * 同一リクエスト内では cache で1回だけ実行する。
 */
export const ensureCurrentTeam = cache(async function ensureCurrentTeam(
  userId: string
): Promise<TeamWithMembership> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentTeamId: true },
  });

  // 通常パス: 選択中チームが有効なら個人チーム作成チェックをスキップ
  if (user?.currentTeamId) {
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId: user.currentTeamId, userId },
      },
      include: { team: { include: { members: true } } },
    });
    if (membership) {
      return membership.team;
    }
  }

  const personal = await ensurePersonalTeam(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { currentTeamId: personal.id },
  });

  return personal;
});

/** 作成者が owner の新規チームを作成し、現在チームに切り替える（slug は内部自動生成） */
export async function createTeamForUser(
  userId: string,
  input: { name: string }
): Promise<Team> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("チーム名を入力してください");
  }
  if (name.length > 100) {
    throw new Error("チーム名は100文字以内で入力してください");
  }

  const slug = await resolveUniqueTeamSlug(generateSlug(10));

  const team = await prisma.$transaction(async (tx) => {
    const created = await tx.team.create({
      data: {
        name,
        slug,
        ownerUserId: userId,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { currentTeamId: created.id },
    });

    return created;
  });

  return team;
}

/** 所属チームへ切り替え */
export async function switchCurrentTeam(userId: string, teamId: string): Promise<Team> {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    include: { team: true },
  });
  if (!membership) {
    throw new Error("Team not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { currentTeamId: teamId },
  });

  return membership.team;
}

export async function getOwnedTeamOrThrow(userId: string, teamId: string): Promise<Team> {
  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerUserId: userId },
  });
  if (!team) {
    throw new Error("Team not found");
  }
  return team;
}

/** チームメンバーならカレンダーにアクセス可 */
export async function findAccessibleCalendar(userId: string, calendarId: string) {
  return prisma.schedulingCalendar.findFirst({
    where: {
      id: calendarId,
      team: {
        members: { some: { userId } },
      },
    },
    include: {
      participants: {
        select: { userId: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

function generateInvitePublicId(): string {
  return randomBytes(16).toString("hex");
}

function generateInviteToken(): string {
  return randomBytes(48).toString("hex");
}

export function buildTeamInviteUrl(
  invitePublicId: string,
  inviteToken: string,
  baseUrl?: string
): string {
  const base = (
    baseUrl ??
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3002"
  ).replace(/\/$/, "");
  return `${base}/team/${invitePublicId}/invite/${inviteToken}`;
}

export async function listTeamMembers(teamId: string): Promise<TeamMemberListItem[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return members
    .map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      joinedAt: m.createdAt.toISOString(),
    }))
    .sort((a, b) => {
      if (a.role === b.role) return 0;
      return a.role === "owner" ? -1 : 1;
    });
}

async function assertTeamOwner(userId: string, teamId: string): Promise<Team> {
  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerUserId: userId },
  });
  if (!team) {
    throw new Error("FORBIDDEN");
  }
  return team;
}

/** 招待リンクを取得。無ければ作成（owner のみ） */
export async function ensureTeamInviteLink(
  userId: string,
  teamId: string
): Promise<{ url: string; created: boolean }> {
  const team = await assertTeamOwner(userId, teamId);

  if (team.invitePublicId && team.inviteToken) {
    return {
      url: buildTeamInviteUrl(team.invitePublicId, team.inviteToken),
      created: false,
    };
  }

  const invitePublicId = generateInvitePublicId();
  const inviteToken = generateInviteToken();
  await prisma.team.update({
    where: { id: team.id },
    data: {
      invitePublicId,
      inviteToken,
      inviteCreatedAt: new Date(),
    },
  });

  return {
    url: buildTeamInviteUrl(invitePublicId, inviteToken),
    created: true,
  };
}

/** 招待リンクを再発行（古いリンクは無効） */
export async function reissueTeamInviteLink(
  userId: string,
  teamId: string
): Promise<{ url: string }> {
  await assertTeamOwner(userId, teamId);

  const invitePublicId = generateInvitePublicId();
  const inviteToken = generateInviteToken();
  await prisma.team.update({
    where: { id: teamId },
    data: {
      invitePublicId,
      inviteToken,
      inviteCreatedAt: new Date(),
    },
  });

  return { url: buildTeamInviteUrl(invitePublicId, inviteToken) };
}

export async function findTeamInvite(invitePublicId: string, inviteToken: string) {
  if (!invitePublicId || !inviteToken) return null;
  return prisma.team.findFirst({
    where: {
      invitePublicId,
      inviteToken,
    },
    select: {
      id: true,
      name: true,
      invitePublicId: true,
      inviteToken: true,
    },
  });
}

/**
 * 招待を受けてチームに参加し、現在チームに切り替える。
 * 既にメンバーなら切り替えのみ。
 */
export async function acceptTeamInvite(
  userId: string,
  invitePublicId: string,
  inviteToken: string
): Promise<{ teamId: string; teamName: string; alreadyMember: boolean }> {
  const team = await findTeamInvite(invitePublicId, inviteToken);
  if (!team) {
    throw new Error("INVALID_INVITE");
  }

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId } },
  });

  if (!existing) {
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: "member",
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { currentTeamId: team.id },
  });

  return {
    teamId: team.id,
    teamName: team.name,
    alreadyMember: Boolean(existing),
  };
}
