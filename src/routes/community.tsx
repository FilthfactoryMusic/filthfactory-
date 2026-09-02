import { createFileRoute } from "@tanstack/react-router";
import { LegalDocView } from "@/components/legal-doc";
import { legalBySlug } from "@/lib/legal";

export const Route = createFileRoute("/community")({ component: Page });

function Page() {
  const doc = legalBySlug("community");
  if (!doc) return null;
  return <LegalDocView doc={doc} />;
}
