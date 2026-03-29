"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TorrentPlayer from "@/components/TorrentPlayer";
import Link from "next/link";

interface TorrentDetail {
  name: string;
  hash: string;
  magnetLink: string;
  seeders?: number;
  leechers?: number;
  size?: string;
  category?: string;
  source?: string;
}

export default function MagnetPage() {
  const searchParams = useSearchParams();
  const magnetLink = searchParams.get("link") || "";
  const [torrent, setTorrent] = useState<TorrentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseMagnetLink = async () => {
      if (!magnetLink) {
        setError("No magnet link provided");
        setIsLoading(false);
        return;
      }

      try {
        // First, parse the magnet link with our API
        const parseResponse = await fetch(
          `/api/magnet?link=${encodeURIComponent(magnetLink)}`,
        );
        const parseData = await parseResponse.json();

        if (!parseData.success) {
          setError(parseData.error || "Invalid magnet link");
          setIsLoading(false);
          return;
        }

        const { hash, name } = parseData.data;

        // Try to find more info from database or live sources
        try {
          const dbResponse = await fetch(
            `/api/torrents?q=${encodeURIComponent(hash)}`,
          );
          const dbData = await dbResponse.json();

          if (dbData.success && dbData.data?.length > 0) {
            // Found in database
            setTorrent(dbData.data[0]);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Ignore DB fetch errors, continue with basic info
        }

        // If not in database, use the parsed magnet link data
        setTorrent({
          name,
          hash,
          magnetLink,
          category: "Streaming",
        });
      } catch (err: any) {
        setError(err.message || "Failed to process magnet link");
      } finally {
        setIsLoading(false);
      }
    };

    parseMagnetLink();
  }, [magnetLink]);

  if (!magnetLink) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="text-red-500">No magnet link provided</p>
        <Link href="/" className="text-red-600 hover:text-red-500">
          Back to Home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading magnet link...</p>
      </div>
    );
  }

  if (error || !torrent) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="text-red-500">{error || "Failed to load magnet link"}</p>
        <Link href="/" className="text-red-600 hover:text-red-500">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <header className="bg-gradient-to-b from-gray-900 to-transparent border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white truncate">
            {torrent.name}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player */}
          <div className="lg:col-span-2">
            <TorrentPlayer
              magnetLink={torrent.magnetLink}
              fileName={torrent.name}
            />
          </div>

          {/* Details */}
          <aside className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-white font-bold text-lg mb-4">Actions</h2>

              <button
                onClick={() => {
                  // Open magnet link in default torrent client
                  window.location.href = torrent.magnetLink;
                }}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors mb-4"
              >
                🔗 Open in Torrent Client
              </button>

              <p className="text-gray-400 text-xs">
                If streaming doesn't work, use this button to open the magnet
                link in your default torrent client (qBittorrent, Transmission,
                etc.)
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-white font-bold text-lg mb-4">Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-semibold break-words">
                    {torrent.name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Hash</p>
                  <p className="text-gray-300 text-xs break-all font-mono">
                    {torrent.hash}
                  </p>
                </div>

                {torrent.size && (
                  <div>
                    <p className="text-gray-400 text-sm">Size</p>
                    <p className="text-white font-semibold">{torrent.size}</p>
                  </div>
                )}

                {torrent.seeders !== undefined && (
                  <div>
                    <p className="text-gray-400 text-sm">Seeders</p>
                    <p className="text-green-400 font-semibold">
                      {torrent.seeders}
                    </p>
                  </div>
                )}

                {torrent.leechers !== undefined && (
                  <div>
                    <p className="text-gray-400 text-sm">Leechers</p>
                    <p className="text-orange-400 font-semibold">
                      {torrent.leechers}
                    </p>
                  </div>
                )}

                {torrent.source && (
                  <div>
                    <p className="text-gray-400 text-sm">Source</p>
                    <p className="text-white font-semibold">{torrent.source}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-2">Magnet Link</p>
                  <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 break-all overflow-auto max-h-20">
                    {torrent.magnetLink}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>Magnet link loaded • StreamResponsibly</p>
        </div>
      </footer>
    </main>
  );
}
