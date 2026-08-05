import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGatePlaceholder } from "@/components/AuthGatePlaceholder";

export const Route = createFileRoute("/auth")({
  // The auth pages depend on the browser-held Supabase session, and the
  // protected-route gate redirects here during hydration. Skipping SSR with the
  // same placeholder as that gate keeps first paint identical in both trees.
  ssr: false,
  pendingMs: 0,
  pendingComponent: AuthGatePlaceholder,
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
