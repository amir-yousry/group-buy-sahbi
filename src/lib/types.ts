// Core domain types — match what a real backend would expose

export type UserRole = "consumer" | "organizer";
export type KycStatus = "none" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  role: UserRole;
  kycStatus: KycStatus;
  kycRejectionReason?: string;
  // Organizer payment template
  payment?: PaymentDetails;
  // Aggregated stats (organizer)
  rating?: number; // 0-10
  reviewsCount?: number;
  successCount?: number;
  failedCount?: number;
  joinedAt: string;
}

export interface PaymentDetails {
  instapay?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export type GroupStatus = "active" | "succeeded" | "failed";
export type MemberStatus = "pending" | "approved" | "rejected";

export interface GroupMember {
  userId: string;
  userName: string;
  status: MemberStatus;
  proofImage?: string;
  uploadedAt: string;
  rejectionReason?: string;
}

export interface Group {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  images: string[];
  groupPrice: number;
  originalPrice?: number;
  minBuyers: number;
  maxBuyers: number;
  expiresAt: string; // ISO
  createdAt: string;
  status: GroupStatus;
  members: GroupMember[];
  payment: PaymentDetails;
  category?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  // WhatsApp-like receipts: list of user ids who have received / read
  deliveredTo?: string[];
  readBy?: string[];
}

export type ConversationType = "group" | "direct";

export interface Conversation {
  id: string;
  type: ConversationType;
  groupId?: string; // for group chats and direct chats tied to a group
  title: string;
  image?: string;
  participants: string[]; // user ids
  lastMessage?: ChatMessage;
  unread?: number;
}

export interface Review {
  id: string;
  organizerId: string;
  groupId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-10
  text?: string;
  createdAt: string;
}
