import { createFileRoute } from "@tanstack/react-router";
import { MerchPage } from "@/routes/merch";

export const Route = createFileRoute("/shop")({ component: MerchPage });
