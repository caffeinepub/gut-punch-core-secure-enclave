# Specification

## Summary
**Goal:** Ensure the shared/public app URL always renders the main analyzer UI, while restricting only Stripe-related upgrade actions when payments are unavailable.

**Planned changes:**
- Remove Stripe-configuration/status gating that can block initial rendering of the core UI (Header + MainAnalyzer + Footer) on shared/public sessions.
- Adjust Pro Access/upgrade screen to always show the normal plans UI; when Stripe is not configured or status checks fail, disable paid upgrade actions and show clear inline “payments unavailable” messaging (without replacing the page with setup guidance).
- Hide any admin setup/navigation affordances (e.g., “Go to Admin Dashboard”) from non-admin users while keeping it available for confirmed admins.
- Update backend Stripe configuration status endpoints used by public UI to be safe for anonymous callers and never throw; always return a boolean status.

**User-visible outcome:** Opening the app from a shared/public link shows the full analyzer interface instead of a blank page, and the upgrade area gracefully indicates when payments are unavailable while keeping admin-only setup links hidden from non-admins.
