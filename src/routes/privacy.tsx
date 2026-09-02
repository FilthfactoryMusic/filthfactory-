import { createFileRoute } from "@tanstack/react-router";
import { LegalDocView } from "@/components/legal-doc";
import { legalBySlug } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({ component: Page });

function Page() {
  const doc = legalBySlug("privacy");
  if (!doc) return null;
  return <LegalDocView doc={doc} />;
}
