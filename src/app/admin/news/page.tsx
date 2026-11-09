"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Save, X, Newspaper } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  views: number;
  isPublished: boolean;
  authorName: string;
}

const categories = ["Update", "Event", "Maintenance", "Announcement", "Changelog", "Rules"];

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNews(); }, []);

  async function fetchNews() {
    const res = await fetch("/api/news?all=true");
    const data = await res.json();
    setNews(data.news || []);
    setLoading(false);
  }

  async function handleSave(item: NewsItem) {
    if (item.id && news.find((n) => n.id === item.id)) {
      await fetch(`/api/news/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } else {
      await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    setEditing(null);
    setIsCreating(false);
    fetchNews();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    fetchNews();
  }

  function startCreate() {
    setIsCreating(true);
    setEditing({
      id: "", title: "", excerpt: "", content: "",
      category: "Announcement", date: new Date().toISOString().split("T")[0],
      views: 0, isPublished: true, authorName: "NightSide Team",
    });
  }

  const published = news.filter((n) => n.isPublished).length;
  const drafts = news.length - published;
  const totalViews = news.reduce((sum, n) => sum + (Number(n.views) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">News Management</span>
          <h1 className="admin-page-header__title">Manage Articles</h1>
          <p className="admin-page-header__desc">Create, edit and manage your NightSide Roleplay news articles</p>
        </div>
        <button onClick={startCreate} className="admin-btn admin-btn--primary">
          <Plus size={14} /> New Article
        </button>
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "24px" }}>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--accent"><Newspaper size={16} /></div>
          <div>
            <div className="admin-stat__value">{news.length}</div>
            <div className="admin-stat__label">Total Articles</div>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--success"><Eye size={16} /></div>
          <div>
            <div className="admin-stat__value">{published}</div>
            <div className="admin-stat__label">Published</div>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--warning"><Edit size={16} /></div>
          <div>
            <div className="admin-stat__value">{drafts}</div>
            <div className="admin-stat__label">Drafts</div>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--accent"><Eye size={16} /></div>
          <div>
            <div className="admin-stat__value">{totalViews.toLocaleString()}</div>
            <div className="admin-stat__label">Total Views</div>
          </div>
        </div>
      </div>

      {(editing || isCreating) && (
        <div className="admin-card" style={{ marginBottom: "24px" }}>
          <div className="admin-card__header">
            <div className="admin-card__header-title">{isCreating ? "New Article" : "Edit Article"}</div>
            <button onClick={() => { setEditing(null); setIsCreating(false); }} className="admin-btn admin-btn--ghost admin-btn--icon">
              <X size={14} />
            </button>
          </div>
          <div className="admin-card__body">
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Title</label>
                <input type="text" value={editing?.title || ""} onChange={(e) => setEditing(editing ? { ...editing, title: e.target.value } : null)} className="admin-input" placeholder="Article title..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Excerpt</label>
                <input type="text" value={editing?.excerpt || ""} onChange={(e) => setEditing(editing ? { ...editing, excerpt: e.target.value } : null)} className="admin-input" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Content</label>
                <textarea value={editing?.content || ""} onChange={(e) => setEditing(editing ? { ...editing, content: e.target.value } : null)} rows={6} className="admin-input" style={{ resize: "none" }} placeholder="Full article content..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Category</label>
                  <select value={editing?.category || "Announcement"} onChange={(e) => setEditing(editing ? { ...editing, category: e.target.value } : null)} className="admin-input admin-select">
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Author</label>
                  <input type="text" value={editing?.authorName || ""} onChange={(e) => setEditing(editing ? { ...editing, authorName: e.target.value } : null)} className="admin-input" placeholder="Author name..." />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Status</label>
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input type="checkbox" checked={editing?.isPublished || false} onChange={(e) => setEditing(editing ? { ...editing, isPublished: e.target.checked } : null)} className="w-3.5 h-3.5 rounded border-[var(--admin-border)] bg-[var(--admin-bg)] accent-[var(--admin-accent)]" />
                    <span className="text-[12px] text-[var(--admin-text)]">Published</span>
                  </label>
                </div>
                <button onClick={() => editing && handleSave(editing)} className="admin-btn admin-btn--primary">
                  <Save size={13} /> {isCreating ? "Create" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__header-title">Articles</div>
            <div className="admin-card__header-desc">{news.length} total articles</div>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Views</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="text-[13px] font-medium text-white truncate max-w-[280px]">{item.title}</div>
                    <div className="text-[11px] text-[var(--admin-text-dim)] truncate max-w-[280px]">{item.excerpt}</div>
                  </td>
                  <td>
                    <span className="text-[12px] text-[var(--admin-text-muted)]">{item.category}</span>
                  </td>
                  <td>
                    <span className="text-[12px] text-[var(--admin-text-muted)]">{item.date}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="text-[12px] text-[var(--admin-text-muted)] flex items-center justify-center gap-1">
                      <Eye size={11} /> {item.views}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`admin-badge ${item.isPublished ? "admin-badge--success" : "admin-badge--muted"}`}>
                      <span className="admin-badge__dot" />
                      {item.isPublished ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(item); setIsCreating(false); }} className="admin-btn admin-btn--ghost admin-btn--icon" title="Edit">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="admin-btn admin-btn--danger admin-btn--icon" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">
                      <div className="admin-empty__icon"><Newspaper size={20} /></div>
                      <div className="admin-empty__title">No articles yet</div>
                      <div className="admin-empty__desc">Create your first article to get started</div>
                      <button onClick={startCreate} className="admin-btn admin-btn--primary admin-btn--sm">
                        <Plus size={12} /> Create Article
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
