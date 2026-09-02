import { createFileRoute } from "@tanstack/react-router";
import { LegalDocView } from "@/components/legal-doc";
import { legalBySlug } from "@/lib/legal";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  const doc = legalBySlug("terms");
  if (!doc) return null;
  return <LegalDocView doc={doc} />;
}
