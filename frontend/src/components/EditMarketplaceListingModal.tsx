import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, FileText, Image, File, Loader2, AlertCircle } from 'lucide-react';
import { useUpdateMarketplaceListing } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { ExternalBlob, type MarketplaceListing } from '../backend';
import { toast } from 'sonner';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Commerce', 'Engineering', 'Arts', 'History', 'Geography', 'Computer Science', 'Other'];
const CLASS_YEARS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate', 'Postgraduate', 'Other'];

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

const ACCEPTED_FORMATS =
  'image/jpeg,image/png,image/gif,image/webp,' +
  'video/mp4,video/webm,video/avi,video/mov,' +
  'application/pdf,' +
  'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,' +
  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  '.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.avi,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
  if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 text-green-500" />;
  if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />;
  return <File className="w-6 h-6 text-muted-foreground" />;
}

interface EditMarketplaceListingModalProps {
  open: boolean;
  onClose: () => void;
  listing: MarketplaceListing;
}

export default function EditMarketplaceListingModal({
  open,
  onClose,
  listing,
}: EditMarketplaceListingModalProps) {
  const updateListing = useUpdateMarketplaceListing();
  const { actor, isFetching: actorFetching } = useActor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [subject, setSubject] = useState(listing.subject);
  const [classYear, setClassYear] = useState(listing.classYear);
  const [sellerName, setSellerName] = useState(listing.sellerName);
  const [sellerWhatsapp, setSellerWhatsapp] = useState(listing.sellerWhatsapp);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // For image files show a preview URL; for others show the direct URL
  const existingIsImage = listing.photo.mimeType.startsWith('image/');
  const [photoPreview, setPhotoPreview] = useState<string>(
    existingIsImage ? listing.photo.fileBlob.getDirectURL() : ''
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) newErrors.price = 'Valid price is required';
    if (!subject) newErrors.subject = 'Subject is required';
    if (!classYear) newErrors.classYear = 'Class/Year is required';
    if (!sellerName.trim()) newErrors.sellerName = 'Seller name is required';
    if (!sellerWhatsapp.trim()) newErrors.sellerWhatsapp = 'WhatsApp number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, photo: 'Maximum file size is 10 GB. Your file is too large.' }));
      return;
    }
    setErrors((prev) => { const n = { ...prev }; delete n.photo; return n; });
    setPhotoFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview('');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Actor readiness check
    if (actorFetching) {
      toast.error('Backend service is initializing, please try again in a moment.');
      return;
    }
    if (!actor) {
      toast.error('Unable to connect to backend service. Please ensure you are logged in and try again.');
      return;
    }

    let photoFileMetadata = listing.photo;

    if (photoFile) {
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const fileBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setUploadProgress(pct));
      photoFileMetadata = {
        filename: photoFile.name,
        mimeType: photoFile.type || 'application/octet-stream',
        size: BigInt(photoFile.size),
        fileBlob,
      };
    }

    try {
      await updateListing.mutateAsync({
        listingId: listing.listingId,
        updateData: {
          title: title.trim(),
          price: BigInt(Math.round(Number(price))),
          subject,
          classYear,
          photo: photoFileMetadata,
          sellerName: sellerName.trim(),
          sellerWhatsapp: sellerWhatsapp.trim(),
        },
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update listing';
      if (msg.toLowerCase().includes('actor') || msg.toLowerCase().includes('not available')) {
        toast.error('Backend service is not ready. Please wait a moment and try again.');
      } else {
        toast.error(msg);
      }
    }
  };

  // Determine what to show in the file preview area
  const currentMimeType = photoFile ? photoFile.type : listing.photo.mimeType;
  const currentFilename = photoFile ? photoFile.name : listing.photo.filename;

  const isActorReady = !!actor && !actorFetching;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Marketplace Listing</DialogTitle>
        </DialogHeader>

        {actorFetching && (
          <Alert className="mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Connecting to backend service...</AlertDescription>
          </Alert>
        )}

        {!actorFetching && !actor && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to backend service. Please ensure you are logged in.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NCERT Maths Class 10"
            />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="edit-price">Price (RM)</Label>
            <Input
              id="edit-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 25.00"
              min="1"
            />
            {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
          </div>

          <div>
            <Label>Class / Year</Label>
            <Select value={classYear} onValueChange={setClassYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select class/year" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_YEARS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classYear && <p className="text-destructive text-xs mt-1">{errors.classYear}</p>}
          </div>

          <div>
            <Label htmlFor="edit-seller-name">Your Name</Label>
            <Input
              id="edit-seller-name"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Your name"
            />
            {errors.sellerName && <p className="text-destructive text-xs mt-1">{errors.sellerName}</p>}
          </div>

          <div>
            <Label htmlFor="edit-whatsapp">WhatsApp Number</Label>
            <Input
              id="edit-whatsapp"
              value={sellerWhatsapp}
              onChange={(e) => setSellerWhatsapp(e.target.value)}
              placeholder="e.g. 60123456789"
            />
            {errors.sellerWhatsapp && <p className="text-destructive text-xs mt-1">{errors.sellerWhatsapp}</p>}
          </div>

          <div>
            <Label>File / Photo</Label>
            <p className="text-xs text-muted-foreground mb-2">Max file size: 10 GB</p>
            {/* Preview area */}
            <div className="mb-2 border border-border rounded-lg p-3 flex items-center gap-3 bg-muted/20">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-md border shrink-0"
                />
              ) : (
                <span className="shrink-0">{getFileIcon(currentMimeType)}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentFilename || 'Current file'}</p>
                <p className="text-xs text-muted-foreground">{currentMimeType}</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Change File
            </Button>
            {errors.photo && <p className="text-destructive text-xs mt-1">{errors.photo}</p>}
            {updateListing.isPending && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateListing.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateListing.isPending || !isActorReady}>
            {updateListing.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : actorFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
