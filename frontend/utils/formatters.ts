/**
 * Format a date string or ISO date into a readable format
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "September 25, 2023")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};
