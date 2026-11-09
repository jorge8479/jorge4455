import { NextResponse } from "next/server";
import { getNews, createNews, getAllNews } from "@/lib/news";
import { z } from "zod";

const CreateNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required").max(10000),
  category: z.enum(["Update", "Event", "Maintenance", "Announcement", "Changelog", "Rules"]).optional(),
  isPublished: z.boolean().optional(),
  authorName: z.string().max(100).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    const rawNews = await getAllNews();
    const news = rawNews.map((item) => ({
      ...item,
      description: item.description || item.excerpt || "",
      author: item.author || item.authorName || "NightSide Team",
    }));
    return NextResponse.json({ news });
  }

  const rawNews = await getNews();
  const news = rawNews.map((item) => ({
    ...item,
    description: item.description || item.excerpt || "",
    author: item.author || item.authorName || "NightSide Team",
  }));
  return NextResponse.json({ news });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateNewsSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const { title, excerpt, content, category, isPublished, authorName } = parsed.data;

    const news = await createNews({
      title,
      excerpt: excerpt || "",
      content,
      category: category || "Announcement",
      date: new Date().toISOString().split("T")[0],
      isPublished: isPublished !== false,
      authorName: authorName || "NightSide Team",
    });

    return NextResponse.json({ news }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}
