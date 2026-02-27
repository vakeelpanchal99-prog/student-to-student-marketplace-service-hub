import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsCallerAdmin,
  useGetAllMarketplaceListingsAdmin,
  useGetAllServiceListingsAdmin,
  useSoftDeleteMarketplaceListing,
  useSoftDeleteServiceListing,
} from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Shield, Trash2, BookOpen, Briefcase, Lock, Loader2, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import type { MarketplaceListing, ServiceListing } from '../backend';

function MarketplaceAdminCard({
  listing,
  onDelete,
  isDeleting,
}: {
  listing: MarketplaceListing;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const isImage = listing.photo?.mimeType?.startsWith('image/');
  const imageUrl = isImage ? listing.photo?.fileBlob?.getDirectURL?.() : undefined;

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden shadow-xs ${!listing.active ? 'opacity-50 border-destructive/30' : 'border-border'}`}>
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{listing.title}</h3>
            <Badge
              variant={listing.active ? 'default' : 'destructive'}
              className="text-[9px] px-1.5 py-0 flex-shrink-0 rounded-full"
            >
              {listing.active ? 'Active' : 'Deleted'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {listing.subject} · {listing.classYear}
          </p>
          <p className="text-xs text-muted-foreground">
            <IndianRupee className="h-3 w-3 inline" />{listing.price.toString()} · {listing.sellerName}
          </p>
          <p className="text-[10px] text-muted-foreground">📱 {listing.sellerWhatsapp}</p>
        </div>
      </div>

      {listing.active && (
        <div className="px-3 pb-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                className="w-full rounded-xl h-8 text-xs font-semibold"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                Delete Listing
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-xs rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This will hide the listing from public view. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(listing.listingId)}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

function ServiceAdminCard({
  listing,
  onDelete,
  isDeleting,
}: {
  listing: ServiceListing;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className={`bg-card border rounded-2xl p-3 shadow-xs ${!listing.active ? 'opacity-50 border-destructive/30' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-sm text-foreground">{listing.helperName}</h3>
        <Badge
          variant={listing.active ? 'default' : 'destructive'}
          className="text-[9px] px-1.5 py-0 flex-shrink-0 rounded-full"
        >
          {listing.active ? 'Active' : 'Deleted'}
        </Badge>
      </div>
      <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0 mb-2">
        {listing.category}
      </Badge>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{listing.serviceDescription}</p>
      <p className="text-[10px] text-muted-foreground mb-2">📱 {listing.helperWhatsapp}</p>

      {listing.active && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              className="w-full rounded-xl h-8 text-xs font-semibold"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Delete Service
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this service?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                This will hide the service from public view. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(listing.listingId)}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: marketplaceListings, isLoading: mlLoading } = useGetAllMarketplaceListingsAdmin();
  const { data: serviceListings, isLoading: slLoading } = useGetAllServiceListingsAdmin();
  const { mutateAsync: deleteMarketplace } = useSoftDeleteMarketplaceListing();
  const { mutateAsync: deleteService } = useSoftDeleteServiceListing();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDeleteMarketplace = async (listingId: string) => {
    setDeletingIds((prev) => new Set(prev).add(listingId));
    try {
      await deleteMarketplace(listingId);
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(listingId); return s; });
    }
  };

  const handleDeleteService = async (listingId: string) => {
    setDeletingIds((prev) => new Set(prev).add(listingId));
    try {
      await deleteService(listingId);
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(listingId); return s; });
    }
  };

  if (!isAuthenticated || adminLoading) {
    return (
      <div className="px-4 py-8 flex flex-col items-center text-center">
        <div className="bg-muted rounded-full p-4 mb-4">
          <Shield className="h-8 w-8 text-muted-foreground" />
        </div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="animate-fade-in px-4 py-8 flex flex-col items-center text-center">
        <div className="bg-destructive/10 rounded-full p-4 mb-4">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          You don't have admin privileges to access this dashboard.
        </p>
      </div>
    );
  }

  const activeMarketplace = marketplaceListings?.filter((l) => l.active).length ?? 0;
  const activeServices = serviceListings?.filter((l) => l.active).length ?? 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border sticky top-14 z-40">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-extrabold text-foreground">Admin Dashboard</h1>
        </div>
        <p className="text-xs text-muted-foreground">Manage all listings and services</p>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-xs">
          <div className="text-2xl font-extrabold text-primary">{activeMarketplace}</div>
          <div className="text-xs text-muted-foreground font-medium">Active Listings</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-xs">
          <div className="text-2xl font-extrabold text-accent">{activeServices}</div>
          <div className="text-xs text-muted-foreground font-medium">Active Services</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-6">
        <Tabs defaultValue="marketplace">
          <TabsList className="w-full rounded-xl mb-4 bg-muted h-9">
            <TabsTrigger value="marketplace" className="flex-1 rounded-lg text-xs font-semibold gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Marketplace ({marketplaceListings?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-1 rounded-lg text-xs font-semibold gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Services ({serviceListings?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-3 mt-0">
            {mlLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : !marketplaceListings?.length ? (
              <div className="text-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No marketplace listings yet</p>
              </div>
            ) : (
              marketplaceListings.map((listing) => (
                <MarketplaceAdminCard
                  key={listing.listingId}
                  listing={listing}
                  onDelete={handleDeleteMarketplace}
                  isDeleting={deletingIds.has(listing.listingId)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-3 mt-0">
            {slLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-3 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : !serviceListings?.length ? (
              <div className="text-center py-10">
                <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No service listings yet</p>
              </div>
            ) : (
              serviceListings.map((listing) => (
                <ServiceAdminCard
                  key={listing.listingId}
                  listing={listing}
                  onDelete={handleDeleteService}
                  isDeleting={deletingIds.has(listing.listingId)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="px-4 pb-6 text-center">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'student-hub')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
