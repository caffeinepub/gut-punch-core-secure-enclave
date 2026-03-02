# Specification

## Summary
**Goal:** Add 15 custom ForeverRaw Gargoyle Dragon emojis with an in-chat emoji picker, implement a permanent Internet Identity-based ban system, gate media uploads behind II authentication, add optional deeper identity verification, and enhance media theft detection to trigger permanent identity-tied bans.

**Planned changes:**
- Generate 15 custom transparent PNG emoji assets (128x128px each) in dark cracked-stone/ember/dragon-scale style and serve from `frontend/public/assets/generated/`
- Add a custom emoji picker to ChatScreen that displays all 15 emojis; clicking one inserts it into the message input and renders inline (24x24px) in sent messages
- Extend the backend Motoko actor with a stable `bannedPrincipals` map (principal → reason + timestamp), `banUser()` admin function, and `isBanned()` query; bans are tied to Internet Identity principal permanently
- Update BanGate in App.tsx to call `isBanned()` on every app load for the authenticated principal and show BanScreen if banned, blocking all navigation
- Gate photo/video uploads in ChatScreen behind Internet Identity authentication; unauthenticated users see a modal with the message "We don't sell your data. We just make sure the Dragon knows who's who so real people stay safe." and a Login with Internet Identity button; banned principals are blocked from uploading
- Add an optional deeper verification tier in Profile/Settings where authenticated users can submit a selfie or ID image; backend stores a `verificationRequest` record (principal, timestamp, status); verified users display a "Trusted Dragon" badge in chat
- Enhance MediaProtection so screenshot/download/copy attempts call `banUser()` with reason `media_theft`, display "The Dragon caught you stealing. Account permanently removed." overlay, and redirect to BanScreen

**User-visible outcome:** Users can send dragon-themed custom emojis in chat; media uploads require Internet Identity login; banned principals (including media thieves) are permanently blocked on any login with the same identity; users can optionally submit deeper verification for a trusted badge.
