import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { REPORT_REASONS, type ReportReason, type ReportTarget } from "@/lib/legal";
import { hashString } from "@/lib/utils";

const TARGETS: ReportTarget[] = ["mix", "live", "user", "comment"];

export const fileReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { targetType: ReportTarget; targetId: string; reason: ReportReason; details?: string }) => d)
  .handler(async ({ context, data }) => {
    if (!TARGETS.includes(data.targetType)) throw new Error("Invalid target");
    if (!REPORT_REASONS.some((r) => r.id === data.reason)) throw new Error("Invalid reason");
    const targetId = data.targetId.trim().slice(0, 120);
    if (!targetId) throw new Error("Nothing to report");
    const details = (data.details ?? "").trim().slice(0, 500);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = `r-${hashString(context.userId + targetId + Date.now()).toString(36)}`;
    await sql`
      insert into reports (id, reporter_id, target_type, target_id, reason, details)
      values (${id}, ${context.userId}, ${data.targetType}, ${targetId}, ${data.reason}, ${details})
    `;
    return { id };
  });

export const blockUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((blockedId: string) => blockedId)
  .handler(async ({ context, data: blockedId }) => {
    const id = blockedId.trim().slice(0, 120);
    if (!id || id === context.userId) throw new Error("Cannot block");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into blocks (user_id, blocked_id)
      values (${context.userId}, ${id})
      on conflict (user_id, blocked_id) do nothing
    `;
    return { blockedId: id };
  });

export const unblockUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((blockedId: string) => blockedId)
  .handler(async ({ context, data: blockedId }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from blocks where user_id = ${context.userId} and blocked_id = ${blockedId}`;
  });

export const listMyBlocks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ blocked_id: string }>`
      select blocked_id from blocks where user_id = ${context.userId} order by created_at desc
    `;
    return rows.map((r) => r.blocked_id);
  });
