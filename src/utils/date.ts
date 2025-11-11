export function formatDateForJira(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ensureJiraDueDate(input: Date | string): string {
  if (input instanceof Date) {
    return formatDateForJira(input);
  }
  // If already yyyy-MM-dd, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  // Try to parse and normalize
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    return formatDateForJira(parsed);
  }
  // As a last resort, return the original string (API will error with details)
  return input;
}


