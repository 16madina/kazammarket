/**
 * Format a date as a relative time string in French
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "il y a 2h", "hier", "il y a 3 jours")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) {
    return "À l'instant";
  }
  
  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  }
  
  if (diffHours < 24) {
    return `il y a ${diffHours}h`;
  }
  
  if (diffDays === 1) {
    return "Hier";
  }
  
  if (diffDays < 7) {
    return `il y a ${diffDays} jours`;
  }
  
  if (diffWeeks === 1) {
    return "il y a 1 semaine";
  }
  
  if (diffWeeks < 4) {
    return `il y a ${diffWeeks} semaines`;
  }
  
  if (diffMonths === 1) {
    return "il y a 1 mois";
  }
  
  if (diffMonths < 12) {
    return `il y a ${diffMonths} mois`;
  }
  
  // More than a year, show date
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}
