'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageSearchButton from '@/components/search/ImageSearchButton';
import BarcodeSearchButton from '@/components/search/BarcodeSearchButton';

interface Suggestion {
  title: string;
  slug: string;
}

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 8;

const TRENDING_SEARCHES = [
  'wireless earbuds',
  'laptop stand',
  'phone case',
  'mechanical keyboard',
  'usb-c hub',
];

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  const recent = getRecentSearches().filter(s => s !== query.trim());
  recent.unshift(query.trim());
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  const recent = getRecentSearches().filter(s => s !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setRecentSearches(getRecentSearches());
    setShowDropdown(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowDropdown(false);
    if (query.trim()) saveRecentSearch(query.trim());
    setRecentSearches(getRecentSearches());
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    router.push(`/products?${params.toString()}`);
  };

  const searchFor = (term: string) => {
    setQuery(term);
    setShowDropdown(false);
    saveRecentSearch(term);
    const params = new URLSearchParams();
    params.set('q', term);
    if (category) params.set('category', category);
    router.push(`/products?${params.toString()}`);
  };

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const showRecent = query.length < 2 && recentSearches.length > 0;
  const showTrending = query.length < 2;
  const showSuggestionsList = query.length >= 2 && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="flex-1 flex items-center h-10 rounded-md overflow-visible relative">
      <form onSubmit={handleSubmit} className="flex w-full h-full">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="hidden md:block h-full bg-gray-200 text-black text-xs px-2 border-r border-gray-300 rounded-l-md cursor-pointer outline-none"
        >
          <option value="">All</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
          <option value="clothing">Clothing</option>
          <option value="home-kitchen">Home &amp; Kitchen</option>
          <option value="toys-games">Toys &amp; Games</option>
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={handleFocus}
            placeholder="Search Evara"
            className="w-full h-full px-3 text-black outline-none text-sm"
          />
          {showDropdown && (showRecent || showTrending || showSuggestionsList) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-80 overflow-y-auto">
              {/* Recent Searches */}
              {showRecent && (
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-500 px-2 mb-1">Recent Searches</p>
                  {recentSearches.map(s => (
                    <div
                      key={s}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => searchFor(s)}
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {s}
                      </div>
                      <button
                        onClick={(e) => handleRemoveRecent(e, s)}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {showTrending && (
                <div className="p-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 px-2 mb-1">Trending</p>
                  {TRENDING_SEARCHES.map(s => (
                    <div
                      key={s}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm text-gray-700"
                      onClick={() => searchFor(s)}
                    >
                      <svg className="w-3.5 h-3.5 text-amazon-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Autocomplete Suggestions */}
              {showSuggestionsList && (
                <div className="border-t border-gray-100">
                  {suggestions.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-100 border-b border-gray-100 last:border-0"
                      onClick={() => {
                        setQuery(s.title);
                        saveRecentSearch(s.title);
                        setShowDropdown(false);
                        router.push(`/products/${s.slug}`);
                      }}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-amazon-orange hover:bg-amazon-yellow h-full px-4 rounded-r-md"
          aria-label="Search"
        >
          <svg className="w-5 h-5 text-amazon-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
      <ImageSearchButton />
      <BarcodeSearchButton />
    </div>
  );
}
