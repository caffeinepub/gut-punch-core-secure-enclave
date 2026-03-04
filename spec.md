# ForeverRaw – Gut Punch (Full Finish Pass)

## Current State

The app is a fully built ForeverRaw / Gut Punch Secure Enclave app with:
- React frontend, Motoko backend on ICP
- Routes: `/` (splash), `/chat`, `/scan`, `/consultant`, `/safe-draft`, `/console`, `/profile`, `/upgrade`, `/destroy-rebuild`, `/payment-success`, `/payment-failure`
- SideMenu with hamburger button (works)
- ChatScreen with media upload, emoji picker, MediaProtection, Dragon branding
- ForgeSplashScreen with Owner/Creator credits, Gatekeeper modal, Sanctuary Tools grid, Sonic controls
- ScanScreen with threat analysis (text input), amber HUD flicker on high risk
- ConsultantScreen with DRAGONFLIES protocol (login-gated)
- SafeDraftScreen with local-only vault
- ConsoleScreen with system status
- ProfileView with encrypted Extra Something field
- ProAccessUpgrade page with tier comparison (Forge Your Power button NOT wired to checkout)
- DestroyRebuildSection with Symbicort check and Sonic module
- AppContext with daily scan tracking (time-elapsed reset, not midnight reset)
- Backend: Stripe checkout, ban system, subscription, usage stats, market config
- Custom emojis in EmojiPicker
- BandwidthSidebar, SanctuaryModeToggle, MasterStrikeButton, LedgerSearchBar in TacticalHUD
- Admin dashboard (AdminDashboard.tsx) exists but no route or menu item pointing to it

## Requested Changes (Diff)

### Add
- **Admin Panel route & menu entry** – Add `/admin` route for AdminDashboard and an "Admin" item at the bottom of SideMenu (visible only when identity is admin or when `isCallerAdmin` returns true; fall back to showing it always for now so it's accessible)
- **Midnight scan reset** – Replace the time-elapsed daily scan reset with a true calendar-date reset: check if `lastScanDate !== today's date string` and reset; run this check on app load and each time the scan screen is visited
- **Scan count UI on ScanScreen** – Show "Scans left: X/10" for free users; show "UNLIMITED" for Pro users. Gate the Scan button: disable and show upgrade prompt once limit is reached (10 scans/day free)
- **Scan count on ForgeSplashScreen** – Show current scan count badge on the ANXIETY SCAN card
- **Stripe checkout wiring** – Wire the "FORGE YOUR POWER" button in ProAccessUpgrade to call `createCheckoutSession` via the actor. Use the first product from `getProducts()` if available, or fallback to a hardcoded price. Redirect to `/payment-success` on success and `/payment-failure` on cancel.
- **Voice navigation** – Add a floating microphone button (bottom-right) on the main layout that listens for commands: "go to chat", "open scan", "open consultant", "open safe draft", "open console", "open profile", "upgrade" — and navigates accordingly. Show a brief "listening…" toast while active. Use the Web Speech API (`window.SpeechRecognition`).

### Modify
- **AppContext midnight reset** – Change `incrementDailyScans` to check today's calendar date string (`new Date().toDateString()`) against stored `lastScanDate`; reset to 0 if different before incrementing. Also add a `useEffect` on app mount that resets if date changed.
- **ProAccessUpgrade Stripe button** – Replace the static button with a wired version that calls `createCheckoutSession` and redirects to Stripe checkout URL.
- **SideMenu** – Add "Admin" nav item at the bottom of the nav list (before the auth footer), pointing to `/admin`. Show for all users (admin-only enforcement happens inside AdminDashboard).
- **ChatScreen route redirect** – The Chat item in the side menu currently points to `/` but the chat component is at `/chat`. The SideMenu already uses `/` for Chat which maps to ForgeSplashScreen. Fix: change the Chat menu item path to `/chat` so it goes directly to the chat screen.
- **ForgeSplashScreen** – "START A GUT PUNCH" button already goes to `/chat` — keep. Add a subtle scan counter badge to the Anxiety Scan tool card.
- **ConsultantScreen** – Remove the login gate on the DRAGONFLIES protocol accordion steps. The consultant screen shows useful free-tier content; only gate the AI-powered deep analysis if/when that's added. Currently it just shows the protocol steps — these should be visible without login.

### Remove
- Nothing removed

## Implementation Plan

1. **AppContext**: Update daily scan reset logic to use calendar date comparison. Add on-mount reset check.
2. **ScanScreen**: Add scan count display ("Scans left: X/10" or "UNLIMITED"). Disable scan button when limit reached, show upgrade CTA.
3. **ForgeSplashScreen**: Add scan count badge on the Anxiety Scan card.
4. **ProAccessUpgrade**: Wire "FORGE YOUR POWER" button to `createCheckoutSession` actor call. Show loading state. Handle errors gracefully (show error if Stripe not configured).
5. **SideMenu**: Add Admin menu item (path `/admin`). Fix Chat path to `/chat`.
6. **App.tsx**: Add `/admin` route for AdminDashboard.
7. **Voice navigation**: Add `VoiceNav` component with floating mic button, SpeechRecognition hook, and route dispatch. Mount in AppLayout.
8. **ConsultantScreen**: Remove login gate from DRAGONFLIES steps (show them to everyone).
9. **All components**: Ensure data-ocid markers on all interactive elements.
