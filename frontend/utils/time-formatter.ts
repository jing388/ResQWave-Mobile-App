/**
 * Format a date as "time ago" (e.g., "2 days ago", "just now")
 * Matches the web focal dashboard implementation for consistency
 */
export function formatTimeAgo(date: Date | string | null | undefined): string {
    if (!date) return 'Unknown';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return 'Unknown';
        }

        const now = new Date();
        const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    } catch {
        return 'Unknown';
    }
}
