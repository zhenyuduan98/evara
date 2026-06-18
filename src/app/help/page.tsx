'use client';

import { useState, useEffect } from 'react';

interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  children: HelpCategory[];
}

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string;
  categoryId?: string;
  tags: string[];
}

export default function HelpCenterPage() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/help/categories').then((r) => r.json()).then(setCategories);
    fetch('/api/help/articles').then((r) => r.json()).then(setArticles);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (search) params.set('search', search);
    fetch(`/api/help/articles?${params}`).then((r) => r.json()).then(setArticles);
  }, [selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Category Tree */}
        <div className="md:col-span-1">
          <h2 className="font-semibold text-lg mb-3">Categories</h2>
          <button
            onClick={() => setSelectedCategory('')}
            className={`block w-full text-left px-3 py-2 rounded ${!selectedCategory ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setSelectedCategory(cat.slug)}
                className={`block w-full text-left px-3 py-2 rounded ${selectedCategory === cat.slug ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                {cat.name}
              </button>
              {cat.children?.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedCategory(child.slug)}
                  className={`block w-full text-left pl-6 pr-3 py-1.5 rounded text-sm ${selectedCategory === child.slug ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="md:col-span-3">
          {articles.length === 0 ? (
            <p className="text-gray-500">No articles found.</p>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {article.body.substring(0, 200)}...
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{article.category}</span>
                    {article.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
