import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, Plus, ShoppingBag, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetActiveMarketplaceListings, useMarkAsPurchased, useCreateMeetup } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RatingDisplay from '../components/RatingDisplay';
import RatingModal from '../components/RatingModal';
import LocationShareButton from '../components/LocationShareButton';
import ShareVideoButton from '../components/ShareVideoButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MarketplaceListing } from '../backend';

export default function MarketplaceListingsPage() {
  const { identity } = useInternetIdentity();
  const { data: listings, isLoading, error } = useGetActiveMarketplaceListings();
  const markAsPurchasedMutation = useMarkAsPurchased();
  const createMeetupMutation = useCreateMeetup();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [meetupListingId, setMeetupListingId] = useState<string | null>(null);
  const [meetupLocation, setMeetupLocation] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [creatingMeetupId, setCreatingMeetupId] = useState<string | null>(null);

  const categories = ['All', 'Textbooks', 'Electronics', 'Stationery', 'Clothing', 'Other'];

  const filteredListings = (listings ?? []).filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || listing.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleMarkAsPurchased = async (listing: MarketplaceListing) => {
    if (!identity) {
      toast.error('Please log in to purchase items');
      return;
    }
    setPurchasingId(listing.listingId);
    try {
      await markAsPurchasedMutation.mutateAsync(listing.listingId);
      toast.success('Item marked as purchased! Now arrange a meetup.');
      setMeetupListingId(listing.listingId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to mark as purchased';
      toast.error(msg.includes('Unauthorized') ? 'You are not authorized to purchase this item.' : msg);
    } finally {
      setPurchasingId(null);
    }
  };

  const handleCreateMeetup = async (listingId: string) => {
    if (!meetupLocation.trim()) {
      toast.error('Please share your location first');
      return;
    }
    setCreatingMeetupId(listingId);
    try {
      await createMeetupMutation.mutateAsync({ listingId, meetupNote: meetupLocation });
      toast.success('Meetup arranged! Check your profile to track it.');
      setMeetupListingId(null);
      setMeetupLocation('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create meetup';
      toast.error(msg);
    } finally {
      setCreatingMeetupId(null);
    }
  };

  const isOwner = (listing: MarketplaceListing) => {
    return identity && listing.createdBy.toString() === identity.getPrincipal().toString();
  };

  const isBuyer = (listing: MarketplaceListing) => {
    return (
      identity &&
      listing.buyerPrincipal &&
      listing.buyerPrincipal.toString() === identity.getPrincipal().toString()
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Find great deals from fellow students</p>
        </div>
        {identity && (
          <Link to="/marketplace/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Post Item
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load listings. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
          <p className="text-muted-foreground">
            {(listings ?? []).length === 0
              ? 'Be the first to post an item!'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => {
            const isImageFile = listing.photo.mimeType.startsWith('image/');
            const isVideoFile = listing.photo.mimeType.startsWith('video/');
            const photoUrl = isImageFile ? listing.photo.fileBlob.getDirectURL() : null;

            return (
              <div
                key={listing.listingId}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card transition-shadow flex flex-col"
              >
                {/* Photo / File preview */}
                <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                      <ShoppingBag className="w-12 h-12" />
                      <span className="text-xs">{listing.photo.mimeType || 'File'}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                        {listing.title}
                      </h3>
                      {listing.sold && (
                        <Badge variant="secondary" className="shrink-0 text-xs">Sold</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-primary font-bold text-lg">
                        RM {(Number(listing.price) / 100).toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-xs">{listing.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{listing.classYear}</Badge>
                    </div>
                  </div>

                  <RatingDisplay listingId={listing.listingId} />

                  <div className="text-xs text-muted-foreground">
                    <p>👤 {listing.sellerName}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-2">
                    {!listing.sold && !isOwner(listing) && identity && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleMarkAsPurchased(listing)}
                        disabled={purchasingId === listing.listingId}
                      >
                        {purchasingId === listing.listingId ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                        ) : (
                          'Buy Now'
                        )}
                      </Button>
                    )}

                    {listing.sold && isBuyer(listing) && meetupListingId !== listing.listingId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setMeetupListingId(listing.listingId)}
                      >
                        <MapPin className="w-4 h-4" />
                        Arrange Meetup
                      </Button>
                    )}

                    {meetupListingId === listing.listingId && (
                      <div className="space-y-2 p-3 bg-muted/50 rounded-xl border border-border">
                        <p className="text-xs font-medium text-foreground">Share your meetup location:</p>
                        <LocationShareButton
                          selectedLocation={meetupLocation}
                          onLocationSelected={setMeetupLocation}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => { setMeetupListingId(null); setMeetupLocation(''); }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handleCreateMeetup(listing.listingId)}
                            disabled={creatingMeetupId === listing.listingId || !meetupLocation.trim()}
                          >
                            {creatingMeetupId === listing.listingId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                            Confirm
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${listing.sellerWhatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          💬 WhatsApp
                        </Button>
                      </a>
                      {isVideoFile && (
                        <ShareVideoButton
                          listingId={listing.listingId}
                          mimeType={listing.photo.mimeType}
                          size="sm"
                          variant="outline"
                        />
                      )}
                      <RatingModal listingId={listing.listingId} listingTitle={listing.title} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
