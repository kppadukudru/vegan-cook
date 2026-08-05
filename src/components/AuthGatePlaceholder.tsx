/** Neutral first paint shared by the protected-route gate and the auth routes.
 *  Both subtrees opt out of SSR, so rendering the same markup keeps the
 *  server HTML and the hydrated client tree identical while auth resolves. */
export function AuthGatePlaceholder() {
  return <div className="bg-paper min-h-dvh" aria-hidden />;
}
