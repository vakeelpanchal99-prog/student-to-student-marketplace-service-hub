import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Upload, FileText, X, Loader2, BookOpen, AlertCircle, Video, Image, File } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useUploadPaper } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes

const ACCEPTED_FORMATS =
  'video/mp4,video/webm,video/avi,video/mov,video/mkv,' +
  'application/pdf,' +
  'image/jpeg,image/png,image/gif,image/webp,' +
  'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,' +
  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  '.mp4,.webm,.avi,.mov,.mkv,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500 shrink-0" />;
  if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-green-500 shrink-0" />;
  if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500 shrink-0" />;
  return <File className="w-8 h-8 text-primary shrink-0" />;
}

export default function UploadPaperPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const uploadMutation = useUploadPaper();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';

  if (!identity) {
    return (
      <main className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-4">
          <BookOpen className="w-14 h-14 text-primary/60" />
          <h2 className="text-2xl font-bold text-foreground">Login Required</h2>
          <p className="text-muted-foreground">
            You need to be logged in to upload previous year papers.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="gap-2 mt-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login to Upload'
            )}
          </Button>
        </div>
      </main>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File must be 10 GB or smaller. Your file is ${formatFileSize(file.size)}.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) { toast.error('Please enter a title'); return; }
    if (!subject.trim()) { toast.error('Please enter a subject'); return; }
    if (!year || isNaN(Number(year)) || Number(year) < 1900 || Number(year) > new Date().getFullYear()) {
      toast.error('Please enter a valid year'); return;
    }
    if (!selectedFile) { toast.error('Please select a file to upload'); return; }

    // Actor readiness check
    if (actorFetching) {
      toast.error('Service connection is initializing. Please wait a moment and try again.');
      return;
    }
    if (!actor) {
      toast.error('Service connection not ready. Please ensure you are logged in and try again.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const fileBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await uploadMutation.mutateAsync({
        id,
        title: title.trim(),
        subject: subject.trim(),
        year: BigInt(Number(year)),
        description: description.trim(),
        fileMetadata: {
          filename: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          size: BigInt(selectedFile.size),
          fileBlob,
        },
      });

      toast.success('Paper uploaded successfully!');
      navigate({ to: '/papers' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      if (msg.toLowerCase().includes('actor') || msg.toLowerCase().includes('not available')) {
        toast.error('Service connection not ready. Please wait a moment and try again.');
      } else {
        toast.error(msg);
      }
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const currentYear = new Date().getFullYear();
  const isActorReady = !!actor && !actorFetching;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate({ to: '/papers' })}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
        >
          ← Back to Papers
        </button>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Upload className="w-8 h-8 text-primary" />
          Upload Study Material
        </h1>
        <p className="text-muted-foreground mt-1">
          Share exam papers, notes, videos, or any study material. Max file size: 10 GB.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Final Exam 2023 – Data Structures"
            disabled={isUploading}
            required
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Subject / Course <span className="text-destructive">*</span>
          </Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Data Structures, Calculus, Physics"
            disabled={isUploading}
            required
          />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">
            Year <span className="text-destructive">*</span>
          </Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={`e.g., ${currentYear}`}
            min="1900"
            max={currentYear}
            disabled={isUploading}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: describe the content, topics covered, etc."
            rows={3}
            disabled={isUploading}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>
            File <span className="text-destructive">*</span>
          </Label>

          {selectedFile ? (
            <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile.type || 'Unknown type'} · {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Click to select a file</p>
              <p className="text-xs text-muted-foreground">
                Videos, PDFs, Images, Documents — up to 10 GB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS}
            className="hidden"
            onChange={handleFileChange}
          />

          {fileError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isUploading || !isActorReady}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Uploading...'}
            </>
          ) : actorFetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Material
            </>
          )}
        </Button>
      </form>
    </main>
  );
}
