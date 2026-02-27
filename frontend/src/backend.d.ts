import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface FileMetadata {
    size: bigint;
    fileBlob: ExternalBlob;
    mimeType: string;
    filename: string;
}
export type UploadError = {
    __kind__: "fileTooLarge";
    fileTooLarge: string;
} | {
    __kind__: "internalError";
    internalError: string;
} | {
    __kind__: "actorUnavailable";
    actorUnavailable: string;
} | {
    __kind__: "callerNotAuthenticated";
    callerNotAuthenticated: string;
};
export interface MarketplaceListing {
    id: string;
    title: string;
    sellerWhatsapp: string;
    active: boolean;
    subject: string;
    listingId: string;
    createdBy: Principal;
    sold: boolean;
    sellerName: string;
    buyerPrincipal?: Principal;
    photo: FileMetadata;
    price: bigint;
    classYear: string;
}
export interface ListingUpdate {
    title: string;
    sellerWhatsapp: string;
    subject: string;
    sellerName: string;
    photo: FileMetadata;
    price: bigint;
    classYear: string;
}
export interface ServiceListing {
    id: string;
    active: boolean;
    listingId: string;
    createdBy: Principal;
    serviceDescription: string;
    category: string;
    helperWhatsapp: string;
    helperName: string;
}
export interface Notification {
    listingId: string;
    listingType: ListingType;
    message: string;
    timestamp: bigint;
    listingTitle: string;
}
export interface Paper {
    id: string;
    title: string;
    subject: string;
    year: bigint;
    description: string;
    fileMetadata: FileMetadata;
    uploadedAt: bigint;
    uploadedBy: Principal;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    whatsappNumber: string;
}
export enum ListingType {
    service = "service",
    marketplace = "marketplace"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmExchange(listingId: string): Promise<void>;
    createMarketplaceListing(title: string, price: bigint, subject: string, classYear: string, photo: FileMetadata, sellerName: string, sellerWhatsapp: string): Promise<void>;
    createMeetup(listingId: string, meetupNote: string): Promise<void>;
    createRating(listingId: string, rating: number, comment: string | null): Promise<void>;
    createServiceListing(serviceDescription: string, category: string, helperName: string, helperWhatsapp: string): Promise<void>;
    deletePaper(id: string): Promise<void>;
    getActiveMarketplaceListings(): Promise<Array<MarketplaceListing>>;
    getActiveServiceListings(): Promise<Array<ServiceListing>>;
    getAllMarketplaceListingsAdmin(): Promise<Array<MarketplaceListing>>;
    getAllServiceListingsAdmin(): Promise<Array<ServiceListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingRatingSummary(listingId: string): Promise<[number, bigint]>;
    getMarketplaceListingById(listingId: string): Promise<MarketplaceListing | null>;
    getMeetupStatus(listingId: string): Promise<{
        buyerConfirmed: boolean;
        exchangeConfirmed: boolean;
        sellerConfirmed: boolean;
        meetupNote: string;
    }>;
    getMyListings(): Promise<{
        marketplace: Array<MarketplaceListing>;
        services: Array<ServiceListing>;
    }>;
    getPaper(id: string): Promise<Paper | null>;
    getPapers(): Promise<Array<Paper>>;
    getRecentNotifications(): Promise<Array<Notification>>;
    getServiceListingById(listingId: string): Promise<ServiceListing | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAsPurchased(listingId: string): Promise<void>;
    markNotificationsRead(upTo: bigint): Promise<void>;
    resetPurchaseStatus(listingId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    softDeleteMarketplaceListing(listingId: string): Promise<void>;
    softDeleteServiceListing(listingId: string): Promise<void>;
    updateMarketplaceListing(listingId: string, updateData: ListingUpdate): Promise<void>;
    updateMyProfile(displayName: string, whatsappNumber: string, bio: string): Promise<void>;
    updateServiceListing(listingId: string, updateData: {
        serviceDescription: string;
        category: string;
        helperWhatsapp: string;
        helperName: string;
    }): Promise<void>;
    uploadFile(filename: string, mimeType: string, size: bigint, blob: ExternalBlob): Promise<{
        __kind__: "ok";
        ok: FileMetadata;
    } | {
        __kind__: "err";
        err: UploadError;
    }>;
    uploadPaper(id: string, title: string, subject: string, year: bigint, description: string, fileMetadata: FileMetadata): Promise<void>;
}
