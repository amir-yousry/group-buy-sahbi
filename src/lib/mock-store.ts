// Tiny LocalStorage-backed mock store. Replace with real API later.

import {
  MOCK_CONVERSATIONS,
  MOCK_GROUPS,
  MOCK_MESSAGES,
  MOCK_REVIEWS,
  MOCK_USERS,
} from "./mock-data";
import type {
  ChatMessage,
  Conversation,
  Group,
  GroupMember,
  Review,
  User,
} from "./types";

const KEYS = {
  users: "gj_users",
  groups: "gj_groups",
  messages: "gj_messages",
  conversations: "gj_conversations",
  reviews: "gj_reviews",
  currentUserId: "gj_current_user",
  favorites: "gj_favorites",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize once
export function initMockStore() {
  if (!localStorage.getItem(KEYS.users)) write(KEYS.users, MOCK_USERS);
  if (!localStorage.getItem(KEYS.groups)) write(KEYS.groups, MOCK_GROUPS);
  if (!localStorage.getItem(KEYS.messages)) write(KEYS.messages, MOCK_MESSAGES);
  if (!localStorage.getItem(KEYS.conversations))
    write(KEYS.conversations, MOCK_CONVERSATIONS);
  if (!localStorage.getItem(KEYS.reviews)) write(KEYS.reviews, MOCK_REVIEWS);
  if (!localStorage.getItem(KEYS.currentUserId))
    write(KEYS.currentUserId, "u-consumer");
}

export function resetMockStore() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  initMockStore();
}

// ---- Users / Auth ----
export function getUsers(): User[] {
  return read<User[]>(KEYS.users, MOCK_USERS);
}
export function saveUsers(users: User[]) {
  write(KEYS.users, users);
}
export function getCurrentUserId(): string | null {
  return read<string | null>(KEYS.currentUserId, null);
}
export function setCurrentUserId(id: string | null) {
  write(KEYS.currentUserId, id);
}
export function getCurrentUser(): User | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}
export function updateUser(id: string, patch: Partial<User>) {
  const users = getUsers();
  const next = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(next);
  return next.find((u) => u.id === id)!;
}

// ---- Groups ----
export function getGroups(): Group[] {
  return read<Group[]>(KEYS.groups, MOCK_GROUPS);
}
export function saveGroups(groups: Group[]) {
  write(KEYS.groups, groups);
}
export function getGroupById(id: string): Group | undefined {
  return getGroups().find((g) => g.id === id);
}
export function getGroupsByOrganizer(organizerId: string): Group[] {
  return getGroups().filter((g) => g.organizerId === organizerId);
}
export function getGroupsForConsumer(userId: string): Group[] {
  return getGroups().filter((g) =>
    g.members.some((m) => m.userId === userId)
  );
}
export function createGroup(g: Group) {
  const groups = getGroups();
  saveGroups([g, ...groups]);
}
export function updateGroup(id: string, patch: Partial<Group>) {
  const groups = getGroups().map((g) => (g.id === id ? { ...g, ...patch } : g));
  saveGroups(groups);
}
export function joinGroup(groupId: string, member: GroupMember) {
  const groups = getGroups().map((g) => {
    if (g.id !== groupId) return g;
    const others = g.members.filter((m) => m.userId !== member.userId);
    return { ...g, members: [...others, member] };
  });
  saveGroups(groups);
}
export function updateMemberStatus(
  groupId: string,
  userId: string,
  patch: Partial<GroupMember>
) {
  const groups = getGroups().map((g) => {
    if (g.id !== groupId) return g;
    return {
      ...g,
      members: g.members.map((m) =>
        m.userId === userId ? { ...m, ...patch } : m
      ),
    };
  });
  saveGroups(groups);
}

// ---- Chat ----
export function getConversations(): Conversation[] {
  return read<Conversation[]>(KEYS.conversations, MOCK_CONVERSATIONS);
}
export function saveConversations(c: Conversation[]) {
  write(KEYS.conversations, c);
}
export function getConversationsForUser(userId: string) {
  return getConversations().filter((c) => c.participants.includes(userId));
}
export function getMessages(conversationId: string): ChatMessage[] {
  return read<ChatMessage[]>(KEYS.messages, MOCK_MESSAGES).filter(
    (m) => m.conversationId === conversationId
  );
}
export function addMessage(m: ChatMessage) {
  const all = read<ChatMessage[]>(KEYS.messages, MOCK_MESSAGES);
  // Simulate "delivered" to all other participants instantly (mock backend).
  const conv = getConversations().find((c) => c.id === m.conversationId);
  const recipients = (conv?.participants ?? []).filter((p) => p !== m.senderId);
  const enriched: ChatMessage = {
    ...m,
    deliveredTo: Array.from(new Set([...(m.deliveredTo ?? []), ...recipients])),
    readBy: m.readBy ?? [],
  };
  write(KEYS.messages, [...all, enriched]);

  // update last message on conversation
  const convs = getConversations().map((c) =>
    c.id === m.conversationId ? { ...c, lastMessage: enriched } : c
  );
  saveConversations(convs);
}

// Mark every message in a conversation as read by `userId` (excluding own messages).
// Returns true if anything changed.
export function markConversationRead(conversationId: string, userId: string): boolean {
  const all = read<ChatMessage[]>(KEYS.messages, MOCK_MESSAGES);
  let changed = false;
  const next = all.map((m) => {
    if (m.conversationId !== conversationId) return m;
    if (m.senderId === userId) return m;
    const readBy = m.readBy ?? [];
    const deliveredTo = m.deliveredTo ?? [];
    const newRead = readBy.includes(userId) ? readBy : [...readBy, userId];
    const newDelivered = deliveredTo.includes(userId) ? deliveredTo : [...deliveredTo, userId];
    if (newRead === readBy && newDelivered === deliveredTo) return m;
    changed = true;
    return { ...m, readBy: newRead, deliveredTo: newDelivered };
  });
  if (changed) write(KEYS.messages, next);
  return changed;
}

// Compute unread count for a user in a conversation
export function getUnreadCount(conversationId: string, userId: string): number {
  const all = read<ChatMessage[]>(KEYS.messages, MOCK_MESSAGES);
  return all.filter(
    (m) =>
      m.conversationId === conversationId &&
      m.senderId !== userId &&
      !(m.readBy ?? []).includes(userId)
  ).length;
}
export function ensureDirectConversation(params: {
  userA: string;
  userAName: string;
  userB: string;
  userBName: string;
  groupId?: string;
}): Conversation {
  const { userA, userB, userBName, groupId } = params;
  const convs = getConversations();
  const found = convs.find(
    (c) =>
      c.type === "direct" &&
      c.participants.includes(userA) &&
      c.participants.includes(userB) &&
      c.groupId === groupId
  );
  if (found) return found;
  const conv: Conversation = {
    id: `conv-dm-${userA}-${userB}-${Date.now()}`,
    type: "direct",
    title: userBName,
    participants: [userA, userB],
    groupId,
    unread: 0,
  };
  saveConversations([conv, ...convs]);
  return conv;
}
export function ensureGroupConversation(group: Group): Conversation {
  const convs = getConversations();
  const found = convs.find((c) => c.type === "group" && c.groupId === group.id);
  if (found) return found;
  const participants = [
    group.organizerId,
    ...group.members.filter((m) => m.status === "approved").map((m) => m.userId),
  ];
  const conv: Conversation = {
    id: `conv-g-${group.id}`,
    type: "group",
    title: group.title,
    groupId: group.id,
    participants: Array.from(new Set(participants)),
    unread: 0,
  };
  saveConversations([conv, ...convs]);
  return conv;
}

// ---- Reviews ----
export function getReviews(): Review[] {
  return read<Review[]>(KEYS.reviews, MOCK_REVIEWS);
}
export function getReviewsForOrganizer(organizerId: string) {
  return getReviews().filter((r) => r.organizerId === organizerId);
}
export function addReview(r: Review) {
  const reviews = getReviews();
  write(KEYS.reviews, [r, ...reviews]);

  // recompute organizer aggregate
  const orgReviews = [r, ...reviews].filter((x) => x.organizerId === r.organizerId);
  const avg =
    orgReviews.reduce((sum, x) => sum + x.rating, 0) / (orgReviews.length || 1);
  updateUser(r.organizerId, {
    rating: Math.round(avg * 10) / 10,
    reviewsCount: orgReviews.length,
  });
}

// ---- Favorites (per-user, by group id) ----
type FavMap = Record<string, string[]>;

function readFavMap(): FavMap {
  return read<FavMap>(KEYS.favorites, {});
}
function writeFavMap(m: FavMap) {
  write(KEYS.favorites, m);
}
export function getFavorites(userId: string): string[] {
  return readFavMap()[userId] ?? [];
}
export function isFavorite(userId: string, groupId: string): boolean {
  return getFavorites(userId).includes(groupId);
}
export function toggleFavorite(userId: string, groupId: string): boolean {
  const m = readFavMap();
  const list = m[userId] ?? [];
  const next = list.includes(groupId)
    ? list.filter((id) => id !== groupId)
    : [...list, groupId];
  m[userId] = next;
  writeFavMap(m);
  return next.includes(groupId);
}
export function getFavoriteGroups(userId: string): Group[] {
  const ids = new Set(getFavorites(userId));
  return getGroups().filter((g) => ids.has(g.id));
}
