/** Hash navigation. The router registers the resolver so features do not import it. */
type RouteResolver = (forcedHash?: string) => void;

let resolveRoute: RouteResolver = () => {};

export function registerRouteResolver(resolve: RouteResolver): void {
  resolveRoute = resolve;
}

export function navigate(hash: string): void {
  if (location.hash.slice(1) === hash) resolveRoute();
  else {
    try {
      location.hash = hash;
    } catch {
      resolveRoute(hash);
    }
  }
}
