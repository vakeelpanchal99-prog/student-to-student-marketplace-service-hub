import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, MarketplaceListing, ServiceListing, ListingUpdate, Paper, FileMetadata } from '../backend';
import { ExternalBlob } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Unauthorized')) return null;
        throw err;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateMyProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      whatsappNumber,
      bio,
    }: {
      displayName: string;
      whatsappNumber: string;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMyProfile(displayName, whatsappNumber, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetMyListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ marketplace: MarketplaceListing[]; services: ServiceListing[] }>({
    queryKey: ['myListings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getMyListings();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Unauthorized')) return { marketplace: [], services: [] };
        throw err;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ── Marketplace Listings ──────────────────────────────────────────────────────

export function useGetActiveMarketplaceListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing[]>({
    queryKey: ['activeMarketplaceListings'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveMarketplaceListings();
      } catch (err) {
        console.error('Error fetching marketplace listings:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMarketplaceListingById(listingId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing | null>({
    queryKey: ['marketplaceListing', listingId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMarketplaceListingById(listingId);
      } catch (err) {
        console.error('Error fetching marketplace listing:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!listingId,
  });
}

export function useCreateMarketplaceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      price,
      subject,
      classYear,
      photo,
      sellerName,
      sellerWhatsapp,
    }: {
      title: string;
      price: bigint;
      subject: string;
      classYear: string;
      photo: FileMetadata;
      sellerName: string;
      sellerWhatsapp: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createMarketplaceListing(title, price, subject, classYear, photo, sellerName, sellerWhatsapp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMarketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
    },
  });
}

export function useUpdateMarketplaceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      updateData,
    }: {
      listingId: string;
      updateData: ListingUpdate;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMarketplaceListing(listingId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMarketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useSoftDeleteMarketplaceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.softDeleteMarketplaceListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMarketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['allMarketplaceListingsAdmin'] });
    },
  });
}

// ── Service Listings ──────────────────────────────────────────────────────────

export function useGetActiveServiceListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceListing[]>({
    queryKey: ['activeServiceListings'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveServiceListings();
      } catch (err) {
        console.error('Error fetching service listings:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateServiceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceDescription,
      category,
      helperName,
      helperWhatsapp,
    }: {
      serviceDescription: string;
      category: string;
      helperName: string;
      helperWhatsapp: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createServiceListing(serviceDescription, category, helperName, helperWhatsapp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeServiceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
    },
  });
}

export function useUpdateServiceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      updateData,
    }: {
      listingId: string;
      updateData: {
        serviceDescription: string;
        category: string;
        helperName: string;
        helperWhatsapp: string;
      };
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateServiceListing(listingId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeServiceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useSoftDeleteServiceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.softDeleteServiceListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeServiceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['allServiceListingsAdmin'] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useGetAllMarketplaceListingsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing[]>({
    queryKey: ['allMarketplaceListingsAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getAllMarketplaceListingsAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetAllServiceListingsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceListing[]>({
    queryKey: ['allServiceListingsAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getAllServiceListingsAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ── Ratings ───────────────────────────────────────────────────────────────────

export function useGetListingRatingSummary(listingId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[number, bigint]>({
    queryKey: ['listingRatingSummary', listingId],
    queryFn: async () => {
      if (!actor) return [0, BigInt(0)];
      try {
        return await actor.getListingRatingSummary(listingId);
      } catch (err) {
        console.error('Error fetching rating summary:', err);
        return [0, BigInt(0)];
      }
    },
    enabled: !!actor && !actorFetching && !!listingId,
  });
}

export function useCreateRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      rating,
      comment,
    }: {
      listingId: string;
      rating: number;
      comment: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createRating(listingId, rating, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listingRatingSummary', variables.listingId] });
    },
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function useGetRecentNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['recentNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRecentNotifications();
      } catch (err) {
        console.error('Error fetching notifications:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (upTo: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markNotificationsRead(upTo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
    },
  });
}

// ── Purchase & Meetup Flow ────────────────────────────────────────────────────

export function useMarkAsPurchased() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsPurchased(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMarketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useResetPurchaseStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.resetPurchaseStatus(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMarketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useCreateMeetup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      meetupNote,
    }: {
      listingId: string;
      meetupNote: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createMeetup(listingId, meetupNote);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetupStatus', variables.listingId] });
    },
  });
}

export function useGetMeetupStatus(listingId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    meetupNote: string;
    sellerConfirmed: boolean;
    buyerConfirmed: boolean;
    exchangeConfirmed: boolean;
  } | null>({
    queryKey: ['meetupStatus', listingId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMeetupStatus(listingId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Meetup intent not found') || msg.includes('Unauthorized')) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!listingId,
    retry: false,
  });
}

export function useConfirmExchange() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.confirmExchange(listingId);
    },
    onSuccess: (_data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['meetupStatus', listingId] });
    },
  });
}

// ── Previous Year Papers ──────────────────────────────────────────────────────

export function useListPapers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Paper[]>({
    queryKey: ['papers'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPapers();
      } catch (err) {
        console.error('Error fetching papers:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPaper(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Paper | null>({
    queryKey: ['paper', id],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPaper(id);
      } catch (err) {
        console.error('Error fetching paper:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useUploadPaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      subject,
      year,
      description,
      fileMetadata,
    }: {
      id: string;
      title: string;
      subject: string;
      year: bigint;
      description: string;
      fileMetadata: FileMetadata;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadPaper(id, title, subject, year, description, fileMetadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserPapers'] });
    },
  });
}

export function useDeletePaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePaper(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserPapers'] });
    },
  });
}

export function useGetMyPapers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Paper[]>({
    queryKey: ['currentUserPapers'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        const allPapers = await actor.getPapers();
        const myPrincipal = identity.getPrincipal().toString();
        return allPapers.filter((p) => p.uploadedBy.toString() === myPrincipal);
      } catch (err) {
        console.error('Error fetching my papers:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
