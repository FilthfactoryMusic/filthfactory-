import { createServerFn } from "@tanstack/react-start";
import { merchById } from "@/lib/merch";

export const startMerch = createServerFn({ method: "POST" })
  .validator((d: { sku: string }) => d)
  .handler(async ({ data }) => {
    const item = merchById(data.sku);
    if (!item) throw new Error("UNKNOWN_SKU");
    const { getStripe, publicOrigin, ensureWalletDomains, createMerchCheckout } = await import("@/lib/stripe");
    const stripe = getStripe();
    await ensureWalletDomains(stripe);
    const session = await createMerchCheckout(stripe, {
      sku: item.id,
      name: `Filthfactory ${item.name}`,
      description: item.blurb,
      pence: item.pence,
      origin: publicOrigin(),
    });
    if (!session.url) throw new Error("STRIPE_UNAVAILABLE");
    return { url: session.url };
  });
