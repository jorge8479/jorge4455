"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface News {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
}

export default function LatestNews() {
  const { t } = useLanguage();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const latest3 = news.slice(0, 3);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-header__label">{t.news.label}</span>
            <h2 className="section-header__title">{t.news.title}</h2>
          </div>
          <Link href="/news" className="btn btn--secondary btn--sm">
            {t.news.allNews}
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid-[375px_1fr]">
          {loading ? (
            <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-[13px]">
              Loading news...
            </div>
          ) : latest3.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-[13px]">
              No news published yet. Check back soon for updates!
            </div>
          ) : (
            latest3.map((item, i) => (
              <div key={item.id} className="news-card">
                <div className="news-card__date">{item.date}</div>
                <h3 className="news-card__title">{item.title}</h3>
                <p className="news-card__desc">{item.description}</p>
                <div className="news-card__footer">
                  <span className="news-card__author">{item.author}</span>
                  <span className="news-card__read">{t.news.viewAll}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
