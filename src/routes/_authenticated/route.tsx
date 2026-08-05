import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/** Rendered on the server (and while auth resolves on the client) so the first
 *  paint is identical in both environments — no hydration mismatch. */
function AuthGatePlaceholder() {
  return <div className="bg-paper min-h-dvh" aria-hidden />;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingMs: 0,
  pendingComponent: AuthGatePlaceholder,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});

