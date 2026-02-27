import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Loader2, Edit2, Check, X, ShoppingBag, Wrench, MapPin, BookOpen, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useUpdateMyProfile,
  useGetMyListings,
  useSoftDeleteMarketplaceListing,
  useSoftDeleteServiceListing,
  useGetMyPapers,
  useDeletePaper,
} from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import FileTypeIcon from '../components/FileTypeIcon';
import ShareVideoButton from '../components/ShareVideoButton';
import { downloadFileWithCorrectName } from '../utils/fileDownload';
import type { MarketplaceListing, ServiceListing, Paper } from '../backend';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: myListings, isLoading: listingsLoading } = useGetMyListings();
  const { data: myPapers, isLoading: papersLoading } = useGetMyPapers();
  const updateProfileMutation = useUpdateMyProfile();
  const deleteMarketplaceMutation = useSoftDeleteMarketplaceListing();
  const deleteServiceMutation = useSoftDeleteServiceListing();
  const deletePaperMutation = useDeletePaper();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState('');
  const [downloadingPaperId, setDownloadingPaperId] = useState<string | null>(null);

  if (!identity) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Login Required</h2>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </main>
    );
  }

  const startEditing = () => {
    setDisplayName(profile?.displayName ?? '');
    setWhatsappNumber(profile?.whatsappNumber ?? '');
    setBio(profile?.bio ?? '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({ displayName, whatsappNumber, bio });
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteMarketplace = async (listing: MarketplaceListing) => {
    try {
      await deleteMarketplaceMutation.mutateAsync(listing.listingId);
      toast.success('Listing removed');
    } catch {
      toast.error('Failed to remove listing');
    }
  };

  const handleDeleteService = async (listing: ServiceListing) => {
    try {
      await deleteServiceMutation.mutateAsync(listing.listingId);
      toast.success('Service removed');
    } catch {
      toast.error('Failed to remove service');
    }
  };

  const handleDeletePaper = async (paper: Paper) => {
    try {
      await deletePaperMutation.mutateAsync(paper.id);
      toast.success('Paper deleted');
    } catch {
      toast.error('Failed to delete paper');
    }
  };

  const handleDownloadPaper = async (paper: Paper) => {
    if (downloadingPaperId === paper.id) return;
    setDownloadingPaperId(paper.id);
    try {
      await downloadFileWithCorrectName(
        () => paper.fileMetadata.fileBlob.getBytes(),
        paper.fileMetadata.mimeType,
        paper.fileMetadata.filename,
        paper.title,
      );
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloadingPaperId(null);
    }
  };

  const isBuyerOfListing = (listing: MarketplaceListing) => {
    return (
      identity &&
      listing.buyerPrincipal &&
      listing.buyerPrincipal.toString() === identity.getPrincipal().toString()
    );
  };

  const isSellerOfListing = (listing: MarketplaceListing) => {
    return identity && listing.createdBy.toString() === identity.getPrincipal().toString();
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        {profileLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g., 60123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save
              </Button>
              <Button variant="outline" onClick={cancelEditing} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {profile?.displayName || 'Anonymous Student'}
              </h2>
              {profile?.whatsappNumber && (
                <p className="text-sm text-muted-foreground">📱 {profile.whatsappNumber}</p>
              )}
              {profile?.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
              {!profile && (
                <p className="text-muted-foreground text-sm">No profile set up yet.</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={startEditing} className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* My Listings */}
      <Tabs defaultValue="marketplace">
        <TabsList className="mb-6">
          <TabsTrigger value="marketplace" className="gap-2">
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Wrench className="w-4 h-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="papers" className="gap-2">
            <BookOpen className="w-4 h-4" />
            My Papers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          {listingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (myListings?.marketplace ?? []).length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No marketplace listings yet.</p>
              <Link to="/marketplace/create">
                <Button variant="outline" className="mt-4">Post an item</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(myListings?.marketplace ?? []).map((listing) => (
                <div
                  key={listing.listingId}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {listing.sold ? (
                          <Badge variant="secondary">Sold</Badge>
                        ) : (
                          <span className="text-primary font-bold text-sm">
                            RM {Number(listing.price).toFixed(2)}
                          </span>
                        )}
                        {!listing.active && (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    {listing.active && isSellerOfListing(listing) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleDeleteMarketplace(listing)}
                        disabled={deleteMarketplaceMutation.isPending}
                      >
                        {deleteMarketplaceMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Remove'
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Share video button for video listings */}
                  {listing.photo.mimeType.startsWith('video/') && (
                    <ShareVideoButton
                      listingId={listing.listingId}
                      mimeType={listing.photo.mimeType}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    />
                  )}

                  {listing.sold && (isSellerOfListing(listing) || isBuyerOfListing(listing)) && (
                    <Link
                      to="/meetup/$listingId"
                      params={{ listingId: listing.listingId }}
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <MapPin className="w-4 h-4" />
                        View Meetup
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services">
          {listingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (myListings?.services ?? []).length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No service listings yet.</p>
              <Link to="/services/create">
                <Button variant="outline" className="mt-4">Offer a service</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(myListings?.services ?? []).map((listing) => (
                <div
                  key={listing.listingId}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{listing.helperName}</h3>
                      <Badge variant="outline" className="text-xs mt-1">{listing.category}</Badge>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {listing.serviceDescription}
                      </p>
                    </div>
                    {listing.active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleDeleteService(listing)}
                        disabled={deleteServiceMutation.isPending}
                      >
                        {deleteServiceMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Remove'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Papers Tab */}
        <TabsContent value="papers">
          {papersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (myPapers ?? []).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No papers uploaded yet.</p>
              <Link to="/papers/upload">
                <Button variant="outline" className="mt-4">Upload a paper</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(myPapers ?? []).map((paper) => (
                <div
                  key={paper.id}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{paper.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{paper.subject}</Badge>
                        <span className="text-xs text-muted-foreground">{Number(paper.year)}</span>
                        <FileTypeIcon mimeType={paper.fileMetadata.mimeType} />
                      </div>
                      {paper.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {paper.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={() => handleDownloadPaper(paper)}
                        disabled={downloadingPaperId === paper.id}
                      >
                        {downloadingPaperId === paper.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deletePaperMutation.isPending}
                          >
                            {deletePaperMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Paper</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{paper.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePaper(paper)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Share video button for video papers */}
                  {paper.fileMetadata.mimeType.startsWith('video/') && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <ShareVideoButton
                        paperId={paper.id}
                        mimeType={paper.fileMetadata.mimeType}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
