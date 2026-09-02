import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/live")({ component: LiveLayout });

function LiveLayout() {
  return <Outlet />;
}
