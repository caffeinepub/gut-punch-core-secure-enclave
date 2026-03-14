# Gut-Punch / ForeverRaw – Tactical Overlap Update

## Current State
- App loads `ForgeSplashScreen` at `/` with GatekeeperModal blocking on first visit
- ChatScreen at `/chat` is the main interactive screen
- ScanScreen at `/scan` handles text analysis with daily limit
- TacticalHUD (BandwidthSidebar, SanctuaryModeToggle, MasterStrikeButton, LedgerSearchBar) is rendered as fixed overlay
- No heart rate / camera vitals detection exists
- No sensory grounding wheel exists
- No sovereignty meter exists
- GatekeeperModal is a blocking dialog on first visit
- Language: "crisis", "emergency" terminology may be present in various screens

## Requested Changes (Diff)

### Add
- **SovereigntyMeter** component: animated vertical meter that persists as a background layer on the chat screen, displayed behind message content. Shows a gradient bar from 0-100 with dragon-themed labels. Pulses with BPM state.
- **SensoryGroundingWheel** component: interactive circular 5-4-3-2-1 grounding protocol. Five interactive arc segments (See/Touch/Sound/Feel/Taste). Clicking each segment activates that stage. Stage 5 = text input for 5 objects. Stage 4 = triggers HeartRateMonitor camera scan. Stage 3 = plays built-in ambient stabilizing frequency (432Hz tone generated via Web Audio API). Stages 2/1 = triggers haptic vibration pattern at 60BPM (navigator.vibrate).
- **HeartRateMonitor** component: uses native camera API (getUserMedia with rear camera). Shows live video feed with overlay instructions. Reads pixel brightness values from canvas to detect pulse (PPG). Outputs BPM in real time. Maps BPM to three states: High >100 → Crimson Pulse + "Intense spike detected. Lock in. Reset Breath.", Med 85–100 → Amber Glow + "Physical spike detected. You are safe. Take control—Reset Breath.", Low <85 → Sovereign Green + "Standing Firm. Sovereignty maintained."
- **DragonBreathing** animated overlay: CSS keyframe animation showing dragon silhouette that slowly expands/contracts on a 4-second cycle, placed as absolute background layer behind content

### Modify
- **App.tsx route `/`**: Remove ForgeSplashScreen as the index route. Redirect `/` directly to `/chat`. The GatekeeperModal moves to ChatScreen as a one-time overlay (not blocking full navigation).
- **ChatScreen**: Add SovereigntyMeter as a fixed left-edge background layer. Add floating "GROUNDING" button (bottom-right area, above voice nav) that opens the SensoryGroundingWheel as a full-screen overlay. Add Dragon breathing animation behind the message list. Keep all existing chat, emoji, and media upload functionality intact.
- **GatekeeperModal**: Make it non-blocking. Instead of replacing app render, it appears as a dismissible overlay on first visit, bypassed by clicking anywhere or pressing Enter. Auto-dismisses after 3 seconds.
- **ScanScreen + ConsultantScreen + other screens**: Remove any use of "panic", "emergency", "crisis" language from UI text. Replace with sovereign equivalents: "intensity spike", "heightened state", "resolution needed", "ground your signal".
- **Language guardrails**: Audit ForgeSplashScreen, ConsultantScreen, ScanScreen, BanScreen text for prohibited terms and replace.

### Remove
- TikTok Login Kit integration (not supported on this platform). Stage 3 of the wheel uses a local Web Audio API 432Hz ambient tone instead.
- Splash screen as the default landing — users land directly in chat now.

## Implementation Plan
1. Generate dragon breathing animation background image
2. Create `HeartRateMonitor.tsx` — camera-based PPG with BPM computation, color mapping, and sovereign commands
3. Create `SovereigntyMeter.tsx` — animated vertical meter (0-100), responds to BPM state via context
4. Create `SensoryGroundingWheel.tsx` — SVG arc-based interactive wheel, 5 stages, integrates HeartRateMonitor for Stage 4, Web Audio for Stage 3, vibration for Stage 2/1
5. Add `bpmState` to `AppContext` (currentBpm, bpmCategory: 'crimson'|'amber'|'sovereign')
6. Modify `App.tsx`: index route → `/chat`, add redirect
7. Modify `ChatScreen.tsx`: add SovereigntyMeter, DragonBreathing animation, Grounding Wheel trigger button, move GatekeeperModal here
8. Modify `GatekeeperModal.tsx`: auto-dismiss after 3s, allow click-anywhere to bypass
9. Apply language guardrails to ScanScreen, ConsultantScreen, ForgeSplashScreen
