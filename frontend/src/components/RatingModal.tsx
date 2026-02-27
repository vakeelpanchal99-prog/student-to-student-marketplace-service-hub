import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateRating } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RatingModalProps {
  listingId: string;
  listingTitle: string;
}

export default function RatingModal({ listingId, listingTitle }: RatingModalProps) {
  const { identity } = useInternetIdentity();
  const createRatingMutation = useCreateRating();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      await createRatingMutation.mutateAsync({
        listingId,
        rating,
        comment: comment.trim() || null,
      });
      toast.success('Rating submitted!');
      setOpen(false);
      setRating(0);
      setComment('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit rating';
      toast.error(msg.includes('Unauthorized') ? 'Please log in to rate.' : msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Rate this listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate: {listingTitle}</DialogTitle>
        </DialogHeader>
        {!identity ? (
          <p className="text-muted-foreground text-sm py-4">
            Please log in to submit a rating.
          </p>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      i < (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || createRatingMutation.isPending}
              className="w-full"
            >
              {createRatingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
