import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2, Upload, ArrowLeft, File, Image, Video, FileText, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateMarketplaceListing } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CLASS_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate', 'Other'];
const SUBJECTS = ['Textbooks', 'Electronics', 'Stationery', 'Clothing', 'Other'];

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
  if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500 mx-auto" />;
  if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-green-500 mx-auto" />;
  if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500 mx-auto" />;
  return <File className="w-8 h-8 text-muted-foreground mx-auto" />;
}

export default function CreateMarketplaceListingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const createMutation = useCreateMarketplaceListing();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [subject, setSubject] = useState('');
  const [classYear, setClassYear] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!identity) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Login Required</h2>
        <p className="text-muted-foreground">Please log in to post a marketplace listing.</p>
      </main>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds the 10 GB limit. Please select a smaller file.');
      return;
    }
    setPhotoFile(file);
    // Only show image preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Actor readiness check
    if (actorFetching) {
      toast.error('Backend service is initializing, please try again in a moment.');
      return;
    }
    if (!actor) {
      toast.error('Unable to connect to backend service. Please ensure you are logged in and try again.');
      return;
    }

    if (!title || !price || !subject || !classYear || !sellerName || !sellerWhatsapp) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!photoFile) {
      toast.error('Please upload a file');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await photoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const fileBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await createMutation.mutateAsync({
        title,
        price: BigInt(Math.round(parseFloat(price) * 100)),
        subject,
        classYear,
        photo: {
          filename: photoFile.name,
          mimeType: photoFile.type || 'application/octet-stream',
          size: BigInt(photoFile.size),
          fileBlob,
        },
        sellerName,
        sellerWhatsapp,
      });

      toast.success('Listing posted successfully!');
      navigate({ to: '/marketplace' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create listing';
      if (msg.includes('Unauthorized')) {
        toast.error('You are not authorized to create listings. Please ensure you are logged in.');
      } else if (msg.toLowerCase().includes('actor') || msg.toLowerCase().includes('not available')) {
        toast.error('Backend service is not ready. Please wait a moment and try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const isActorReady = !!actor && !actorFetching;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate({ to: '/marketplace' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Post a Marketplace Item</h1>

        {actorFetching && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Connecting to backend service, please wait...
            </AlertDescription>
          </Alert>
        )}

        {!actorFetching && !actor && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to backend service. Please ensure you are logged in and refresh the page.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>File / Photo *</Label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById('photo-input')?.click()}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
              ) : photoFile ? (
                <div className="space-y-2">
                  {getFileIcon(photoFile.type)}
                  <p className="text-sm font-medium text-foreground truncate px-4">{photoFile.name}</p>
                  <p className="text-xs text-muted-foreground">{photoFile.type || 'Unknown type'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to upload a file</p>
                  <p className="text-xs text-muted-foreground/70">
                    Images, Videos, PDFs, Documents — up to 10 GB
                  </p>
                </div>
              )}
            </div>
            <input
              id="photo-input"
              type="file"
              accept={ACCEPTED_FORMATS}
              className="hidden"
              onChange={handlePhotoChange}
            />
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Calculus Textbook 3rd Edition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (RM) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 25.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Subject/Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Year */}
          <div className="space-y-2">
            <Label>Class Year *</Label>
            <Select value={classYear} onValueChange={setClassYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select your year" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seller Name */}
          <div className="space-y-2">
            <Label htmlFor="sellerName">Your Name *</Label>
            <Input
              id="sellerName"
              placeholder="e.g., Ahmad"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              required
            />
          </div>

          {/* Seller WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="sellerWhatsapp">WhatsApp Number *</Label>
            <Input
              id="sellerWhatsapp"
              placeholder="e.g., 60123456789"
              value={sellerWhatsapp}
              onChange={(e) => setSellerWhatsapp(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isActorReady}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Posting...'}
              </>
            ) : actorFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Post Listing'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
