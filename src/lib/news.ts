export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  content: string;
  category: string;
  date: string;
  views: number;
  isPublished: boolean;
  authorName: string;
  author?: string;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeNewsItem<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };
  const stringFields = ["title", "excerpt", "content", "authorName", "description", "author"];
  for (const field of stringFields) {
    if (typeof sanitized[field] === "string") {
      (sanitized as Record<string, unknown>)[field] = sanitizeInput(sanitized[field] as string);
    }
  }
  return sanitized;
}

function validateId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "welcome",
    title: "Bienvenidos a NightSide Roleplay",
    excerpt: "Descubre una nueva experiencia Roleplay.",
    content: "NightSide Roleplay es un servidor de MTA:SA con modo Roleplay semi-serio. Disfruta de una experiencia única con sistemas de facciones, trabajos, y mucho más.",
    category: "General",
    date: "2026-01-01",
    views: 0,
    isPublished: true,
    authorName: "Admin",
  },
];

let inMemoryNews: NewsItem[] = [...DEFAULT_NEWS];

export async function getNews(): Promise<NewsItem[]> {
  return inMemoryNews
    .filter((n) => n.isPublished)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllNews(): Promise<NewsItem[]> {
  return [...inMemoryNews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  if (!validateId(id)) return null;
  return inMemoryNews.find((n) => n.id === id) || null;
}

export async function createNews(data: Omit<NewsItem, "id" | "views">): Promise<NewsItem> {
  const sanitized = sanitizeNewsItem(data);
  const item: NewsItem = {
    ...sanitized,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36),
    views: 0,
  };
  inMemoryNews.push(item);
  return item;
}

export async function updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem | null> {
  if (!validateId(id)) return null;
  const index = inMemoryNews.findIndex((n) => n.id === id);
  if (index === -1) return null;

  const allowedFields = ["title", "excerpt", "content", "category", "isPublished", "authorName", "description", "author"];
  const filtered = Object.keys(data)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: data[key as keyof NewsItem] }), {});

  const sanitized = sanitizeNewsItem(filtered);
  inMemoryNews[index] = { ...inMemoryNews[index], ...sanitized, id };
  return inMemoryNews[index];
}

export async function deleteNews(id: string): Promise<boolean> {
  if (!validateId(id)) return false;
  const len = inMemoryNews.length;
  inMemoryNews = inMemoryNews.filter((n) => n.id !== id);
  return inMemoryNews.length < len;
}
