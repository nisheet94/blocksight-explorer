/**
 * Formats a UNIX timestamp into a human-readable date-time string.
 *
 * @param {number | null} timestamp - The UNIX timestamp to format, or null if not available.
 * @returns {string} - The formatted date-time string, or "-" if timestamp is null.
 */
export function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null) {
    return '-';
  }

  const date = new Date(timestamp * 1000);
  return date.toLocaleString('it-IT');
}
