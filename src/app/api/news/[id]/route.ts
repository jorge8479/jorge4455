import { NextResponse } from "next/server";
import { getNewsById, updateNews, deleteNews } from "@/lib/news";
import { z } from "zod";

const UpdateNewsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1).max(10000).optional(),
  category: z.enum(["Update", "Event", "Maintenance", "Announcement", "Changelog", "Rules"]).optional(),
  isPublished: z.boolean().optional(),
  authorName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) {
    return NextResponse.json({ error: "News not found" }, { status: 404 });
  }

  return NextResponse.json({ news });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateNewsSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const updated = await updateNews(id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json({ news: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteNews(id);

  if (!deleted) {
    return NextResponse.json({ error: "News not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
