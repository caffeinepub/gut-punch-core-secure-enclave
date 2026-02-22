import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Punch {
    id: string;
    content: string;
    views: bigint;
    userId: Principal;
    likes: bigint;
    timestamp: bigint;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    priceId: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface UserUsageStats {
    dailyScans: bigint;
    lastResetTime: bigint;
}
export interface UsageStats {
    uniqueUserEstimate: bigint;
    recentAppOpenEvents: Array<Time>;
    totalAppOpenCount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MarketConfig {
    isPublished: boolean;
    description: string;
    payoutCurrency: PayoutCurrency;
    totalRoyaltiesEarned: bigint;
    category: MarketCategory;
    priceUSD: bigint;
    walletPrincipal?: Principal;
}
export interface TherapistSession {
    id: string;
    resolutionTips: string;
    clientId: Principal;
    isActive: boolean;
    therapistId: Principal;
    notes: string;
    timestamp: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ChatMessage {
    id: string;
    content: string;
    isRead: boolean;
    receiverId: Principal;
    timestamp: bigint;
    senderId: Principal;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SubscriptionUpdate {
    status: SubscriptionStatus;
    expiresAt?: bigint;
    stripeSubscriptionId?: string;
}
export interface UserProfile {
    name: string;
    email?: string;
    stripeCustomerId?: string;
}
export enum MarketCategory {
    utility = "utility",
    finance = "finance",
    other = "other",
    entertainment = "entertainment",
    productivity = "productivity",
    education = "education",
    business = "business",
    health = "health"
}
export enum PayoutCurrency {
    btc = "btc",
    icp = "icp",
    usdc = "usdc"
}
export enum SubscriptionStatus {
    free = "free",
    proMonthly = "proMonthly",
    proAnnual = "proAnnual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateUser(authToken: string): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPunch(content: string): Promise<string>;
    createTherapistSession(clientId: Principal, notes: string, resolutionTips: string): Promise<string>;
    deleteProduct(productId: string): Promise<void>;
    deletePunch(punchId: string): Promise<void>;
    deleteTherapistSession(sessionId: string): Promise<void>;
    endTherapistSession(sessionId: string): Promise<void>;
    getAllPunches(): Promise<Array<Punch>>;
    getCallerSubscription(): Promise<SubscriptionUpdate | null>;
    getCallerUsageStats(): Promise<UserUsageStats | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(otherUserId: Principal): Promise<Array<ChatMessage>>;
    getMarketConfig(): Promise<MarketConfig>;
    getOnlineStatus(userId: Principal): Promise<boolean>;
    getProducts(): Promise<Array<Product>>;
    getPunch(id: string): Promise<Punch | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTherapistSession(sessionId: string): Promise<TherapistSession | null>;
    getTherapistSessionByTherapist(therapistId: Principal): Promise<Array<TherapistSession>>;
    getTherapistSessionsByClient(clientId: Principal): Promise<Array<TherapistSession>>;
    getTrendingPunches(limit: bigint): Promise<Array<Punch>>;
    getUnreadMessageCount(): Promise<bigint>;
    getUsageStats(): Promise<UsageStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementDailyScans(): Promise<void>;
    incrementPunchViews(punchId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    likePunch(punchId: string): Promise<void>;
    markMessageAsRead(messageId: string): Promise<void>;
    publish(): Promise<void>;
    resetFreeTierUsage(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiverId: Principal, content: string): Promise<string>;
    setOnlineStatus(isOnline: boolean): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    trackAppOpen(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlikePunch(punchId: string): Promise<void>;
    updateCallerSubscription(subscription: SubscriptionUpdate): Promise<void>;
    updateMarketConfig(config: MarketConfig): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    updateTherapistSession(sessionId: string, notes: string, resolutionTips: string, isActive: boolean): Promise<void>;
}
