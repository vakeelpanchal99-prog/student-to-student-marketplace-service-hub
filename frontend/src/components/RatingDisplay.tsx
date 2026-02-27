import { Star } from 'lucide-react';
import { useGetListingRatingSummary } from '../hooks/useQueries';

interface RatingDisplayProps {
  listingId: string;
}

export default function RatingDisplay({ listingId }: RatingDisplayProps) {
  const { data } = useGetListingRatingSummary(listingId);

  const average = data?.[0] ?? 0;
  const count = data ? Number(data[1]) : 0;

  if (count === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="w-3 h-3" />
        <span>No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.round(average) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {average.toFixed(1)} ({count})
      </span>
    </div>
  );
}
