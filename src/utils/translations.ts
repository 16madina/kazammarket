export const translateCondition = (condition: string | null): string => {
  if (!condition) return "Comme neuf";
  
  const translations: { [key: string]: string } = {
    "new": "Neuf",
    "like_new": "Comme neuf",
    "likenew": "Comme neuf",
    "good": "Bon état",
    "fair": "État moyen",
    "poor": "Mauvais état"
  };
  
  return translations[condition.toLowerCase()] || condition;
};
