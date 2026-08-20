// Realistic bundled sample data used when Reddit's live API is unreachable,
// so the app is always demonstrable end-to-end without external network access.
const TITLE_POOL = [
  "React 19 introduces exciting new hooks for state management",
  "Why TypeScript adoption keeps growing among JavaScript developers",
  "Best practices for testing React components with Jest",
  "Node performance improvements in the latest release",
  "GraphQL vs REST: which API style wins in 2026",
  "Webpack five years later: is it still relevant",
  "Understanding closures in JavaScript once and for all",
  "Vite has become the default build tool for modern frontend apps",
  "Tips for debugging async JavaScript code effectively",
  "The rise of server components in React applications",
  "How Redux Toolkit simplified state management for our team",
  "CSS Grid vs Flexbox: when to use each layout system",
  "Machine learning models are transforming JavaScript tooling",
  "A deep dive into the V8 JavaScript engine internals",
  "Why developers are switching from Express to Fastify",
  "The complete guide to React Query for data fetching",
  "JavaScript frameworks continue to evolve rapidly",
  "Building accessible web applications with ARIA roles",
  "Docker containers simplify JavaScript deployment pipelines",
  "TypeScript generics explained with practical examples"
];

// Simple deterministic PRNG so demo data is stable across renders in a session.
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    return value / 0x7fffffff;
  };
}

export function generateMockPosts(subreddit, { start, end }, count = 24) {
  const rand = seededRandom(subreddit ? subreddit.length + 1 : 1);
  const rangeStart = Number(start) || Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const rangeEnd = Number(end) || Math.floor(Date.now() / 1000);
  const span = Math.max(rangeEnd - rangeStart, 1);

  return Array.from({ length: count }, (_, i) => {
    const title = TITLE_POOL[i % TITLE_POOL.length];
    return {
      id: `demo-${i + 1}`,
      title,
      selftext: "",
      score: Math.floor(rand() * 1400) + 50,
      created_utc: Math.floor(rangeStart + rand() * span),
      author: "demo_user",
      subreddit: subreddit || "demo"
    };
  });
}
