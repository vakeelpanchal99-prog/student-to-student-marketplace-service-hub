import { useParams, Link } from '@tanstack/react-router';
import { MapPin, CheckCircle, Clock, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMeetupStatus, useConfirmExchange, useGetMarketplaceListingById } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

function parseCoordinates(meetupNote: string): { lat: number; lng: number } | null {
  const match = meetupNote.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
}

export default function MeetupTrackerPage() {
  const { listingId } = useParams({ from: '/meetup/$listingId' });
  const { identity } = useInternetIdentity();
  const { data: meetupStatus, isLoading: meetupLoading, error: meetupError } = useGetMeetupStatus(listingId);
  const { data: listing } = useGetMarketplaceListingById(listingId);
  const confirmExchangeMutation = useConfirmExchange();

  if (!identity) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Login Required</h2>
        <p className="text-muted-foreground">Please log in to view meetup details.</p>
      </main>
    );
  }

  const handleConfirmExchange = async () => {
    try {
      await confirmExchangeMutation.mutateAsync(listingId);
      toast.success('Exchange confirmed!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm exchange';
      toast.error(msg);
    }
  };

  const coords = meetupStatus ? parseCoordinates(meetupStatus.meetupNote) : null;
  const mapUrl = coords
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lng}&zoom=16&size=600x300&markers=${coords.lat},${coords.lng},red`
    : null;
  const googleMapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : null;
  const osmUrl = coords
    ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=16`
    : null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-2">Meetup Tracker</h1>
      {listing && (
        <p className="text-muted-foreground mb-6">For: <span className="font-medium text-foreground">{listing.title}</span></p>
      )}

      {meetupLoading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {meetupError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load meetup details. You may not have access to this meetup.
          </AlertDescription>
        </Alert>
      )}

      {!meetupLoading && !meetupError && !meetupStatus && (
        <Alert>
          <AlertDescription>
            No meetup has been arranged for this listing yet.
          </AlertDescription>
        </Alert>
      )}

      {!meetupLoading && meetupStatus && (
        <div className="space-y-6">
          {/* Map */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Meetup Location
              </h2>
            </div>
            <div className="relative">
              {coords && mapUrl ? (
                <>
                  <img
                    src={mapUrl}
                    alt="Meetup location map"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="hidden w-full h-48 bg-muted items-center justify-center"
                  >
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Map preview unavailable</p>
                      <p className="text-xs mt-1">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {meetupStatus.meetupNote || 'No location provided'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {(googleMapsUrl || osmUrl) && (
              <div className="p-4 flex gap-3">
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Google Maps
                  </a>
                )}
                {osmUrl && (
                  <a
                    href={osmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    OpenStreetMap
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Exchange Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Buyer confirmed</span>
                {meetupStatus.buyerConfirmed ? (
                  <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Seller confirmed</span>
                {meetupStatus.sellerConfirmed ? (
                  <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Exchange complete</span>
                {meetupStatus.exchangeConfirmed ? (
                  <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>

            {!meetupStatus.exchangeConfirmed && (
              <Button
                className="w-full mt-4"
                onClick={handleConfirmExchange}
                disabled={confirmExchangeMutation.isPending}
              >
                {confirmExchangeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Confirm Exchange'
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
