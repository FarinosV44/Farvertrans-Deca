/**
 * Sistema Vía (#67) — the shared component system. Panel AND admin consume
 * these; there is no second, isolated admin design (#65 AC). Spec:
 * docs/design/sistema-via.md.
 */
export { Kicker } from "./kicker";
export { Pill, type PillTone } from "./pill";
export { Button } from "./button";
export { Alert } from "./alert";
export { EmptyState } from "./empty-state";
export { Progress } from "./progress";
