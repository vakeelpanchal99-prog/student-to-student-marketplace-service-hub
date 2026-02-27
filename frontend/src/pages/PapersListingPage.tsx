import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Upload, BookOpen, Download, Calendar, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListPapers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FileTypeIcon from '../components/FileTypeIcon';
import ShareVideoButton from '../components/ShareVideoButton';
import { downloadFileWithCorrectName } from '../utils/fileDownload';
import type { Paper } from '../backend';

function PaperCard({ paper }: { paper: Paper }) {
  const { identity } = useInternetIdentity();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadFileWithCorrectName(
        () => paper.fileMetadata.fileBlob.getBytes(),
        paper.fileMetadata.mimeType,
        paper.fileMetadata.filename,
        `${paper.title}_${paper.subject}_${Number(paper.year)}`,
      );
    } catch (err) {
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadedDate = new Date(Number(paper.uploadedAt) / 1_000_000).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isVideo = paper.fileMetadata.mimeType.startsWith('video/');

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-card transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{paper.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">{paper.subject}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {Number(paper.year)}
            </span>
            <FileTypeIcon mimeType={paper.fileMetadata.mimeType} />
          </div>
        </div>
      </div>

      {paper.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{paper.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border gap-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <User className="w-3 h-3" />
          Uploaded {uploadedDate}
        </span>
        <div className="flex items-center gap-2">
          {isVideo && (
            <ShareVideoButton
              paperId={paper.id}
              mimeType={paper.fileMetadata.mimeType}
              size="sm"
              variant="outline"
            />
          )}
          {identity ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2 shrink-0"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground italic">Login to download</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PapersListingPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: papers, isLoading } = useListPapers();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const filteredPapers = (papers ?? []).filter((paper) => {
    const q = searchQuery.toLowerCase();
    const s = subjectFilter.toLowerCase();
    const matchesSearch =
      !q ||
      paper.title.toLowerCase().includes(q) ||
      paper.subject.toLowerCase().includes(q) ||
      paper.description.toLowerCase().includes(q);
    const matchesSubject = !s || paper.subject.toLowerCase().includes(s);
    return matchesSearch && matchesSubject;
  });

  const allSubjects = Array.from(new Set((papers ?? []).map((p) => p.subject))).sort();

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Study Materials
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and download past exam papers, notes, and study materials shared by students
          </p>
        </div>
        {identity && (
          <Button
            onClick={() => navigate({ to: '/papers/upload' })}
            className="gap-2 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload Material
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, subject, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          placeholder="Filter by subject..."
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      {/* Subject chips */}
      {allSubjects.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSubjectFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              !subjectFilter
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            All
          </button>
          {allSubjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                subjectFilter.toLowerCase() === s.toLowerCase()
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Papers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No materials found</h3>
          <p className="text-muted-foreground">
            {(papers ?? []).length === 0
              ? 'Be the first to upload a study material!'
              : 'Try adjusting your search or filter.'}
          </p>
          {identity && (
            <Button
              onClick={() => navigate({ to: '/papers/upload' })}
              variant="outline"
              className="mt-4 gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Material
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}

      {!identity && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/marketplace" className="text-primary hover:underline">Log in</Link> to download study materials
          </p>
        </div>
      )}
    </main>
  );
}
