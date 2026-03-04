# ForeverRaw – Gut Punch

## Current State

The app has a ChatScreen (`/chat`) that is a **local-only, single-user chat** — messages are stored in React state only, not persisted to the backend, and there is no concept of other users. The existing backend has a `chatMessages` Map in main.mo but no public API functions to send or read messages between users. There is no user discovery, no contact list, no conversation threads, and no online presence system.

The existing backend has:
- User profiles (`saveCallerUserProfile`, `getCallerUserProfile`, `getUserProfile`)
- Authorization / Internet Identity via `MixinAuthorization`
- Ban system (`banUser`, `isBanned`, `getBanStatus`)
- Subscription system
- `chatMessages` map defined but unused

## Requested Changes (Diff)

### Add

**Backend (Motoko):**
- `UserPublicProfile` type: `{ displayName: Text; tagLine: ?Text; isOnline: Bool; lastSeen: Int }`
- `ConversationThread` type keyed by a sorted pair of principals
- `ChatMsg` type: `{ id: Text; senderId: Principal; content: Text; timestamp: Int; mediaBlobId: ?Text; isRead: Bool }`
- `sendMessage(receiverId: Principal, content: Text, mediaBlobId: ?Text)` — saves a message into the thread between caller and receiver; enforces ban check
- `getMessages(otherUser: Principal, limit: Nat, beforeTimestamp: ?Int)` — returns messages in a thread, paginated newest-first
- `markMessagesRead(otherUser: Principal)` — marks all messages in thread as read
- `getConversations()` — returns list of conversation threads the caller is part of, with last message and unread count
- `searchUsers(query: Text)` — searches public profiles by displayName or tagLine
- `setOnlineStatus(isOnline: Bool)` — caller sets their online/offline presence
- `getUserPublicProfile(user: Principal)` — returns public profile
- `saveCallerPublicProfile(profile: UserPublicProfile)` — saves caller's public profile

**Frontend:**
- `PeopleScreen` (`/people`) — user search with username/tag search input, result cards showing avatar, displayName, tagLine, online status, and "Start Convo" button
- `ConversationsListScreen` (`/conversations`) — list of all active conversation threads with last message preview, unread badge, and online indicator
- `DirectChatScreen` (`/chat/:userId`) — full 1-on-1 real-time chat screen with:
  - Dragon-scale dark background, stone-carved message bubbles
  - Blood-red messages (mine), stone-gray messages (theirs)
  - "Type your punch..." input with dragon-claw send button
  - Photo/video upload button with MediaProtection and ban enforcement
  - ForeverRaw custom emoji picker
  - Polling for new messages (every 3 seconds)
  - Online/offline status header
  - Media protection (screenshot block, watermark)
- Update `SideMenu` to add "People" and "Conversations" nav items
- Update `ChatScreen` (`/chat`) — keep as the broadcast/self chat for solo punches; rename header to distinguish from direct chat
- Update `App.tsx` routes to add `/people`, `/conversations`, `/chat/:userId`

### Modify

- `SideMenu.tsx` — add "People" (user search) and "Conversations" (inbox) items
- `App.tsx` — add new routes
- `ChatScreen.tsx` — minor: keep as-is but update header label to "THE FORGE – YOUR PUNCHES" to distinguish from direct DMs
- `backend.d.ts` — regenerated automatically from new Motoko

### Remove

- Nothing removed

## Implementation Plan

1. Generate new Motoko backend with full user-to-user messaging API (sendMessage, getMessages, getConversations, searchUsers, setOnlineStatus, getUserPublicProfile, saveCallerPublicProfile, markMessagesRead)
2. Build `PeopleScreen` — search bar, user result cards, online indicator, "Start Convo" CTA
3. Build `ConversationsListScreen` — thread list, last message, unread count badge, online dot
4. Build `DirectChatScreen` — full ForeverRaw 1-on-1 chat: stone-carved bubbles, blood-red/stone-gray, emoji picker, media upload with protection, polling for new messages, header with other user's name + online status
5. Update `SideMenu` with new nav items (People, Conversations)
6. Update `App.tsx` with new routes
7. Wire all screens to backend queries/mutations via new hooks
