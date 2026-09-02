import { useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { REPORT_REASONS, type ReportReason, type ReportTarget } from "@/lib/legal";
import { blockUser, fileReport } from "@/lib/moderation-api";
import { Button } from "@/components/ui/button";

export function ReportControl({
  targetType,
  targetId,
  blockId,
}: {
  targetType: ReportTarget;
  targetId: string;
  blockId?: string;
}) {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("copyright");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <a href="/login" className="inline-flex h-11 items-center text-sm text-muted underline underline-offset-4">
        Sign in to report
      </a>
    );
  }

  async function submit() {
    setBusy(true);
    try {
      await fileReport({ data: { targetType, targetId, reason, details } });
      toast("Report sent. We review every one.");
      setOpen(false);
      setDetails("");
    } catch {
      toast("Could not send report");
    } finally {
      setBusy(false);
    }
  }

  async function block() {
    if (!blockId) return;
    setBusy(true);
    try {
      await blockUser({ data: blockId });
      toast("Blocked. They are hidden from your account.");
      setOpen(false);
    } catch {
      toast("Could not block");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="h-11 text-sm text-muted underline underline-offset-4"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Report"}
      </button>
      {open ? (
        <div className="mt-3 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-medium">Report this {targetType}</p>
          <label className="mt-3 block text-sm text-muted">
            Reason
            <select
              className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm text-muted">
            Details (optional)
            <textarea
              className="mt-1 min-h-20 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg"
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => void submit()}>
              {busy ? "Sending…" : "Send report"}
            </Button>
            {blockId ? (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void block()}>
                Block
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
