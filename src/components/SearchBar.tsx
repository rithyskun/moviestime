"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
}

const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_HISTORY = 10;

export default function SearchBar({
  onSearch,
  placeholder = "Search movies and torrents...",
  initialQuery = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load search history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveToHistory = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) return;

    // Remove if already exists (to avoid duplicates), then add to front
    const updated = [
      trimmed,
      ...history.filter((item) => item !== trimmed),
    ].slice(0, MAX_HISTORY);

    setHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const trimmedQuery = query.trim();

      // Check if query is a magnet link
      if (trimmedQuery.toLowerCase().startsWith("magnet:")) {
        // Redirect to magnet page instead of searching
        router.push(`/magnet?link=${encodeURIComponent(trimmedQuery)}`);
        setShowHistory(false);
        return;
      }

      // Regular search
      saveToHistory(trimmedQuery);
      onSearch(trimmedQuery);
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);

    // Check if it's a magnet link
    if (selectedQuery.toLowerCase().startsWith("magnet:")) {
      router.push(`/magnet?link=${encodeURIComponent(selectedQuery)}`);
      setShowHistory(false);
      return;
    }

    saveToHistory(selectedQuery);
    onSearch(selectedQuery);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setShowHistory(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto my-8 relative"
    >
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder={placeholder}
            title="Search movies, torrents, or paste a magnet link"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-red-600 focus:outline-none"
          />
          {/* Search History Dropdown */}
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-2">
                {history.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleHistorySelect(item)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-lg text-gray-200 text-sm transition-colors"
                  >
                    <span className="text-gray-500">↻</span> {item}
                  </button>
                ))}
                <hr className="my-2 border-gray-700" />
                <button
                  type="button"
                  onClick={clearHistory}
                  className="w-full text-left px-4 py-2 hover:bg-red-900 rounded-lg text-red-400 text-sm transition-colors"
                >
                  Clear history
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
