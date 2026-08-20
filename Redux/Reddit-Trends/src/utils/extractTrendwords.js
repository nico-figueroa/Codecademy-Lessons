const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "of", "in", "on", "to", "for", "and", "or", "as", "at", "by", "with",
  "this", "that", "it", "its", "from", "but", "not", "have", "has",
  "had", "will", "would", "can", "could", "i", "you", "he", "she", "we", "they"
]);

export default function extractKeywords(text) {
  if (!text) return [];

  return text
    .split(/\s+/)
    .map(word => word.replace(/[^a-zA-Z]/g, "")) // remove punctuation
    .filter(Boolean)
    .filter(word => !STOPWORDS.has(word.toLowerCase()));
}
