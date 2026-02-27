/**
 * Feature Registry — Checkpoint Document
 *
 * This file documents every feature, route, component, hook, and backend
 * function used by the frontend. It exists solely as a reference so that
 * future changes can be verified against this list to ensure nothing is
 * accidentally removed.
 *
 * DO NOT remove entries from this file. Only add new ones when new features
 * are introduced.
 */

// ---------------------------------------------------------------------------
// Routes (defined in frontend/src/App.tsx)
// ---------------------------------------------------------------------------
export const ROUTES = {
  HOME: '/',
  MARKETPLACE: '/marketplace',
  CREATE_MARKETPLACE_LISTING: '/marketplace/create',
  SERVICES: '/services',
  CREATE_SERVICE_LISTING: '/services/create',
  PAPERS: '/papers',
  UPLOAD_PAPER: '/papers/upload',
  PROFILE: '/profile',
  ADMIN: '/admin',
  MEETUP: '/meetup',
} as const;

// ---------------------------------------------------------------------------
// Page Components (frontend/src/pages/)
// ---------------------------------------------------------------------------
export const PAGE_COMPONENTS = [
  'HomePage',                    // /
  'MarketplaceListingsPage',     // /marketplace
  'CreateMarketplaceListingPage',// /marketplace/create
  'ServiceListingsPage',         // /services
  'CreateServiceListingPage',    // /services/create
  'PapersListingPage',           // /papers
  'UploadPaperPage',             // /papers/upload
  'ProfilePage',                 // /profile
  'AdminDashboardPage',          // /admin
  'MeetupTrackerPage',           // /meetup
] as const;

// ---------------------------------------------------------------------------
// Shared / Reusable Components (frontend/src/components/)
// ---------------------------------------------------------------------------
export const SHARED_COMPONENTS = [
  'Layout',                        // App shell: header, nav, footer
  'NotificationBell',              // Bell icon with unread badge + popover
  'RatingDisplay',                 // Star rating display for listings
  'RatingModal',                   // Dialog for submitting star ratings
  'EditMarketplaceListingModal',   // Dialog for editing marketplace listings
  'EditServiceListingModal',       // Dialog for editing service listings
  'LocationShareButton',           // GPS capture + static map preview
] as const;

// ---------------------------------------------------------------------------
// Auth Components (inline in pages / Layout)
// ---------------------------------------------------------------------------
export const AUTH_COMPONENTS = [
  'ProfileSetupModal',  // First-time login name prompt (inline in App.tsx / Layout)
  'LoginButton',        // Internet Identity login/logout button
] as const;

// ---------------------------------------------------------------------------
// Custom Hooks (frontend/src/hooks/)
// ---------------------------------------------------------------------------
export const HOOKS = {
  // Actor / Identity
  useActor: 'frontend/src/hooks/useActor.ts',
  useInternetIdentity: 'frontend/src/hooks/useInternetIdentity.ts',

  // User Profile
  useGetCallerUserProfile: 'frontend/src/hooks/useQueries.ts',
  useSaveCallerUserProfile: 'frontend/src/hooks/useQueries.ts',
  useUpdateMyProfile: 'frontend/src/hooks/useQueries.ts',

  // Marketplace Listings
  useGetActiveMarketplaceListings: 'frontend/src/hooks/useQueries.ts',
  useGetMarketplaceListingById: 'frontend/src/hooks/useQueries.ts',
  useCreateMarketplaceListing: 'frontend/src/hooks/useQueries.ts',
  useUpdateMarketplaceListing: 'frontend/src/hooks/useQueries.ts',
  useSoftDeleteMarketplaceListing: 'frontend/src/hooks/useQueries.ts',
  useGetAllMarketplaceListingsAdmin: 'frontend/src/hooks/useQueries.ts',

  // Service Listings
  useGetActiveServiceListings: 'frontend/src/hooks/useQueries.ts',
  useGetServiceListingById: 'frontend/src/hooks/useQueries.ts',
  useCreateServiceListing: 'frontend/src/hooks/useQueries.ts',
  useUpdateServiceListing: 'frontend/src/hooks/useQueries.ts',
  useSoftDeleteServiceListing: 'frontend/src/hooks/useQueries.ts',
  useGetAllServiceListingsAdmin: 'frontend/src/hooks/useQueries.ts',

  // Ratings
  useGetListingRatingSummary: 'frontend/src/hooks/useQueries.ts',
  useCreateRating: 'frontend/src/hooks/useQueries.ts',

  // Notifications
  useGetRecentNotifications: 'frontend/src/hooks/useQueries.ts',
  useMarkNotificationsRead: 'frontend/src/hooks/useQueries.ts',

  // Purchase / Meetup Flow
  useMarkAsPurchased: 'frontend/src/hooks/useQueries.ts',
  useResetPurchaseStatus: 'frontend/src/hooks/useQueries.ts',
  useCreateMeetup: 'frontend/src/hooks/useQueries.ts',
  useConfirmExchange: 'frontend/src/hooks/useQueries.ts',
  useGetMeetupStatus: 'frontend/src/hooks/useQueries.ts',

  // Previous Year Papers
  useListPapers: 'frontend/src/hooks/useQueries.ts',
  useGetPaper: 'frontend/src/hooks/useQueries.ts',
  useUploadPaper: 'frontend/src/hooks/useQueries.ts',
  useDeletePaper: 'frontend/src/hooks/useQueries.ts',
  useGetMyPapers: 'frontend/src/hooks/useQueries.ts',

  // Admin
  useGetMyListings: 'frontend/src/hooks/useQueries.ts',
  useIsCallerAdmin: 'frontend/src/hooks/useQueries.ts',
} as const;

// ---------------------------------------------------------------------------
// Backend Interface Methods (from frontend/src/backend.d.ts)
// ---------------------------------------------------------------------------
export const BACKEND_METHODS = [
  // Auth / Roles
  'assignCallerUserRole',
  'getCallerUserRole',
  'isCallerAdmin',

  // User Profile
  'getCallerUserProfile',
  'getUserProfile',
  'saveCallerUserProfile',
  'updateMyProfile',

  // Marketplace
  'createMarketplaceListing',
  'getActiveMarketplaceListings',
  'getMarketplaceListingById',
  'updateMarketplaceListing',
  'softDeleteMarketplaceListing',
  'getAllMarketplaceListingsAdmin',

  // Services
  'createServiceListing',
  'getActiveServiceListings',
  'getServiceListingById',
  'updateServiceListing',
  'softDeleteServiceListing',
  'getAllServiceListingsAdmin',

  // My Listings
  'getMyListings',

  // Ratings
  'createRating',
  'getListingRatingSummary',

  // Notifications
  'getRecentNotifications',
  'markNotificationsRead',

  // Purchase / Meetup
  'markAsPurchased',
  'resetPurchaseStatus',
  'createMeetup',
  'confirmExchange',
  'getMeetupStatus',

  // Papers
  'uploadPaper',
  'getPapers',
  'getPaper',
  'deletePaper',
] as const;

// ---------------------------------------------------------------------------
// Utility Files (frontend/src/utils/ and frontend/src/lib/)
// ---------------------------------------------------------------------------
export const UTILITIES = [
  'frontend/src/utils/timeAgo.ts',   // bigint nanosecond → relative time string
  'frontend/src/lib/utils.ts',       // cn() Tailwind class merger
] as const;

// ---------------------------------------------------------------------------
// Design Tokens
// ---------------------------------------------------------------------------
export const DESIGN_FILES = [
  'frontend/src/index.css',       // OKLCH color system, Plus Jakarta Sans, global styles
  'frontend/tailwind.config.js',  // Extended Tailwind config with custom tokens
] as const;

/**
 * Acceptance Criteria Checklist
 *
 * ✅ All routes in ROUTES are accessible and functional.
 * ✅ Marketplace listing creation, editing, deletion, and meetup flow work.
 * ✅ Service listing creation, editing, and deletion work.
 * ✅ Previous year papers listing page loads; search/filter works; download
 *    is accessible to authenticated users.
 * ✅ Upload paper form submits successfully for authenticated users.
 * ✅ Profile page displays all three tabs (My Listings, My Services, My Papers).
 * ✅ Admin dashboard displays all listings; soft-delete works for admins.
 * ✅ Notification bell shows unread count and popover list.
 * ✅ Star rating submission and display work on listings.
 * ✅ Internet Identity login/logout and profile setup modal work correctly.
 * ✅ No backend functions are removed or have their signatures broken.
 */
