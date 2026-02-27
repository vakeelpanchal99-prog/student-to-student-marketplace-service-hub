/**
 * Converts a timestamp (bigint nanoseconds from IC) to a human-readable relative time string.
 */
export function timeAgo(timestampNs: bigint | number): string {
  const nowMs = Date.now();
  const tsMs = typeof timestampNs === 'bigint'
    ? Number(timestampNs / 1_000_000n)
    : Math.floor(timestampNs / 1_000_000);

  const diffMs = nowMs - tsMs;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
}
