"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import StreamingPlayer from "@/components/StreamingPlayer";
import TorrentPlayer from "@/components/TorrentPlayer";
import Link from "next/link";

interface TorrentDetail {
  _id?: string;
  name: string;
  hash: string;
  magnetLink: string;
  seeders: number;
  leechers: number;
  size: string;
  uploadedDate?: string;
  category: string;
  source?: string;
  url?: string;
}

export default function TorrentPage() {
  const params = useParams();
  const hash = params.id as string;
  const [torrent, setTorrent] = useState<TorrentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTorrent = async () => {
      try {
        // Extract actual hash if full magnet link was passed
        let searchHash = hash;
        if (hash.startsWith("magnet:")) {
          const hashMatch = hash.match(/xt=urn:btih:([a-f0-9]+)/i);
          if (hashMatch) {
            searchHash = hashMatch[1];
          }
        }

        // Try database first
        const dbResponse = await fetch(
          `/api/torrents?q=${encodeURIComponent(searchHash)}`,
        );
        const dbData = await dbResponse.json();

        if (dbData.success && dbData.data?.length > 0) {
          setTorrent(dbData.data[0]);
          setIsLoading(false);
          return;
        }

        // If not in database, search live sources via server API
        const liveResponse = await fetch(
          `/api/torrents/live?q=${encodeURIComponent(searchHash)}`,
        );
        const liveData = await liveResponse.json();

        if (liveData.success && liveData.data?.length > 0) {
          const found = liveData.data.find(
            (t: any) => t.hash.toLowerCase() === searchHash.toLowerCase(),
          );

          if (found) {
            setTorrent({
              name: found.name,
              hash: found.hash,
              magnetLink: found.magnetLink,
              seeders: found.seeders,
              leechers: found.leechers,
              size: found.size,
              category: found.category,
              source: found.source,
              url: found.url,
            });
          } else {
            setError("Torrent not found in any source");
          }
        } else {
          setError("Torrent not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load torrent");
      } finally {
        setIsLoading(false);
      }
    };

    if (hash) {
      fetchTorrent();
    }
  }, [hash]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !torrent) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="text-red-500">{error || "Torrent not found"}</p>
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
          {/* Players */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player - Main */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                🎬 Watch Now
              </h2>
              <VideoPlayer magnetLink={torrent.magnetLink} />
            </div>

            {/* Alternative Streaming Methods */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                📺 Other Streaming Options
              </h2>
              <StreamingPlayer
                hash={torrent.hash}
                name={torrent.name}
                magnetLink={torrent.magnetLink}
              />
            </div>

            {/* Download Methods */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                ⬇️ Download Instead
              </h2>
              <TorrentPlayer
                magnetLink={torrent.magnetLink}
                fileName={torrent.name}
              />
            </div>
          </div>

          {/* Details */}
          <aside className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-white font-bold text-lg mb-4">Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Size</p>
                  <p className="text-white font-semibold">{torrent.size}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white font-semibold">{torrent.category}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Uploaded</p>
                  <p className="text-white font-semibold">
                    {new Date(torrent.uploadedDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Seeds & Peers</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-green-400 font-bold text-lg">
                        {torrent.seeders}
                      </p>
                      <p className="text-gray-500 text-xs">Seeders</p>
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold text-lg">
                        {torrent.leechers}
                      </p>
                      <p className="text-gray-500 text-xs">Leechers</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <a
                    href={`magnet:?${torrent.magnetLink.split("?")[1] || torrent.magnetLink}`}
                    className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Open in Torrent Client
                  </a>
                </div>

                {torrent.url && (
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Source</p>
                    <a
                      href={torrent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-500 break-all text-sm"
                    >
                      {torrent.url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hash Info */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-white font-bold text-sm mb-3">Hash</h3>
              <p className="text-gray-400 text-xs break-all font-mono">
                {torrent.hash}
              </p>
            </div>
          </aside>
        </div>

        {/* Video Player Placeholder */}
        <div className="mt-12 mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">How to Stream</h2>
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <ol className="text-gray-300 space-y-4 list-decimal list-inside">
              <li>Click "Load Torrent" to fetch the torrent metadata</li>
              <li>Wait for the torrent to start downloading</li>
              <li>Select a video file from the list when ready</li>
              <li>Stream directly in the player above</li>
              <li>Or open in your torrent client for full control</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
