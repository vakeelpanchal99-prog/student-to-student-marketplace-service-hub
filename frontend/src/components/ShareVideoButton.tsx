import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ShareVideoButtonProps {
  listingId?: string;
  paperId?: string;
  mimeType: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
}

export default function ShareVideoButton({
  listingId,
  paperId,
  mimeType,
  size = 'sm',
  variant = 'outline',
  className = '',
}: ShareVideoButtonProps) {
  if (!mimeType.startsWith('video/')) return null;

  const handleShare = async () => {
    let url = '';
    if (listingId) {
      url = `${window.location.origin}${window.location.pathname}#/marketplace?id=${encodeURIComponent(listingId)}`;
    } else if (paperId) {
      url = `${window.location.origin}${window.location.pathname}#/papers?id=${encodeURIComponent(paperId)}`;
    } else {
      url = window.location.href;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Video link copied to clipboard!');
    } catch {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Video link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link. Please copy the URL manually.');
      }
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleShare}
      className={`gap-2 ${className}`}
      title="Share video link"
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}
