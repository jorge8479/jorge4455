"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface News {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
}

export default function NewsPage() {
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

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-header__label">{t.newsPage.label}</span>
              <h2 className="section-header__title">{t.newsPage.title}</h2>
            </div>
            <p className="section-header__desc">{t.newsPage.desc}</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-[13px]">
              Loading news...
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-[13px]">
              No news published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="news-card">
                  <div className="news-card__date">{item.date}</div>
                  <h3 className="news-card__title">{item.title}</h3>
                  <p className="news-card__desc">{item.description}</p>
                  <div className="news-card__footer">
                    <span className="news-card__author">{item.author}</span>
                    <span className="news-card__read">{t.newsPage.readFull}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
