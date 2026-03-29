"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import TorrentCard from "@/components/TorrentCard";
import MovieCard from "@/components/MovieCard";
import TorrentSourceFilter from "@/components/TorrentSourceFilter";

interface Torrent {
  _id?: string;
  name: string;
  seeders: number;
  leechers: number;
  size: string;
  uploadedDate?: string;
  category: string;
  hash: string;
  magnetLink: string;
  source: string;
}

interface Movie {
  _id: string;
  title: string;
  description?: string;
  genre?: string[];
  rating?: number;
  posterUrl?: string;
  releaseDate?: string;
}

export default function Home() {
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"torrents" | "movies">(
    "torrents",
  );
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "thepiratebay",
    "1337x",
    "kickass",
    "rarbg",
  ]);
  const [searchSource, setSearchSource] = useState<"cached" | "live" | null>(
    null,
  );
  const [initialQuery, setInitialQuery] = useState("");

  // Restore last search on page load
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      try {
        const history = JSON.parse(saved) as string[];
        if (history.length > 0) {
          setInitialQuery(history[0]);
          // Auto-search with the last query
          performSearch(history[0]);
        }
      } catch {
        // Ignore errors
      }
    }
  }, []);

  /**
   * Check if hash is valid (40 character hex string)
   */
  const isValidHash = (hash: string): boolean => {
    return /^[a-f0-9]{40}$/i.test(hash);
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      if (searchType === "torrents") {
        const sourcesParam =
          selectedSources.length > 0 ? selectedSources.join(",") : "";
        const response = await fetch(
          `/api/torrents?q=${encodeURIComponent(query)}&sources=${sourcesParam}`,
        );
        const data = await response.json();
        if (data.success) {
          // Filter out torrents with invalid hashes
          const validTorrents = data.data.filter((t: Torrent) =>
            isValidHash(t.hash),
          );
          setTorrents(validTorrents);
          setSearchSource(data.source || "live");
        }
      } else {
        const response = await fetch(
          `/api/movies?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        if (data.success) {
          setMovies(data.data);
          setSearchSource(null);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    performSearch(query);
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-black to-transparent border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">MoviesTime</h1>
          <p className="text-gray-400">
            Stream movies and TV shows from torrent sources
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4">
          <button
            onClick={() => setSearchType("torrents")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              searchType === "torrents"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Torrents
          </button>
          <button
            onClick={() => setSearchType("movies")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              searchType === "movies"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Movies
          </button>
        </div>
      </nav>

      {/* Search Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-8">
        <SearchBar
          onSearch={handleSearch}
          placeholder={`Search ${searchType}...`}
          initialQuery={initialQuery}
        />
        {searchType === "torrents" && (
          <div className="max-w-7xl mx-auto px-6 mt-6">
            <TorrentSourceFilter
              selectedSources={selectedSources}
              onSourceChange={setSelectedSources}
            />
            {searchSource && (
              <p className="text-xs text-gray-500 text-center">
                Results from{" "}
                {searchSource === "cached" ? "cache" : "live sources"} •{" "}
                {searchSource === "live" && "Last updated now"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}

        {searchType === "torrents" && !isLoading && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              {torrents.length > 0 ? "Search Results" : "Popular Torrents"}
            </h2>

            {torrents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {torrents.map((torrent, idx) => (
                  <TorrentCard
                    key={torrent._id || `${torrent.hash}-${idx}`}
                    id={torrent._id || torrent.hash}
                    name={torrent.name}
                    seeders={torrent.seeders}
                    leechers={torrent.leechers}
                    size={torrent.size}
                    uploadedDate={torrent.uploadedDate}
                    category={torrent.category}
                    hash={torrent.hash}
                    magnetLink={torrent.magnetLink}
                    source={torrent.source}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No torrents found. Try searching for a movie or show.
                </p>
              </div>
            )}
          </>
        )}

        {searchType === "movies" && !isLoading && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              {movies.length > 0 ? "Search Results" : "Featured Movies"}
            </h2>

            {movies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie._id}
                    id={movie._id}
                    title={movie.title}
                    description={movie.description}
                    genre={movie.genre}
                    rating={movie.rating}
                    posterUrl={movie.posterUrl}
                    releaseDate={movie.releaseDate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No movies found. Try searching for a title.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popular Torrents Section */}
      {!isLoading && torrents.length === 0 && searchType === "torrents" && (
        <div className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">
            Popular Streaming Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-white font-bold mb-3">🔗 Torrent Sites</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>• The Pirate Bay (thepiratebay.org)</li>
                <li>• 1337x (1337x.to)</li>
                <li>• Kickass Torrents (kickass.to)</li>
                <li>• RARBG (rarbg.to)</li>
              </ul>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-white font-bold mb-3">📺 How to Search</h3>
              <p className="text-gray-400 text-sm">
                Use the search bar above to find torrents and movies. Connect to
                a torrent site URL to fetch live data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>MoviesTime © 2026 - Stream responsibly</p>
        </div>
      </footer>
    </main>
  );
}
