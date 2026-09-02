import { createFileRoute } from "@tanstack/react-router";
import { LegalDocView } from "@/components/legal-doc";
import { legalBySlug } from "@/lib/legal";

export const Route = createFileRoute("/cookies")({ component: Page });

function Page() {
  const doc = legalBySlug("cookies");
  if (!doc) return null;
  return <LegalDocView doc={doc} />;
}
