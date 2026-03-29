"use client";

import React, { useState } from "react";

interface VideoPlayerProps {
  magnetLink: string;
}

/**
 * Video Player Component
 * Opens streaming options for watching torrents
 */
export default function VideoPlayer({ magnetLink }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const startStreaming = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract hash from magnet link
      const hashMatch = magnetLink.match(/xt=urn:btih:([a-f0-9]+)/i);
      if (!hashMatch) {
        throw new Error("Invalid magnet link");
      }

      const hash = hashMatch[1].toLowerCase();

      // Try to get streaming URL from our proxy
      const response = await fetch(`/api/stream/proxy?hash=${hash}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Streaming service not available for this torrent",
        );
      }

      setStreamUrl(result.data.url);
      setSelectedService(result.data.service);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start streaming";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (streamUrl && selectedService) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden border border-gray-700">
        {/* Embedded Streaming */}
        <div className="relative bg-black aspect-video">
          <iframe
            key={streamUrl}
            src={streamUrl}
            className="w-full h-full"
            allowFullScreen
            allow="encrypted-media"
          />
        </div>

        {/* Player Info */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm">Streaming from</p>
              <p className="text-white font-semibold">{selectedService}</p>
            </div>
            <button
              onClick={() => {
                setStreamUrl(null);
                setSelectedService(null);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
            >
              Close
            </button>
          </div>

          <div className="text-xs text-gray-400">
            ✨ If playback doesn&apos;t work, try refreshing or download instead
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Start Streaming */}
      <div className="bg-linear-to-r from-blue-950 to-blue-900 border border-blue-700 rounded-lg p-4">
        <h3 className="text-blue-400 font-bold mb-2">▶️ Stream in Browser</h3>
        <p className="text-gray-300 text-sm mb-4">
          Open this torrent in an online streaming player (no download needed):
        </p>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-3 mb-4">
            <p className="text-red-300 text-sm font-semibold">Error: {error}</p>
            <p className="text-red-400 text-xs mt-1">
              Streaming isn&apos;t available for this torrent. Use the Download
              option instead.
            </p>
          </div>
        )}

        <button
          onClick={() => startStreaming()}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Finding Stream...
            </>
          ) : (
            <>
              <span>▶️</span>
              Try Streaming Now
            </>
          )}
        </button>

        <p className="text-gray-400 text-xs mt-3">
          ℹ️ Tries multiple streaming services - may take 10-30 seconds
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2 text-sm">
          📺 Popular Streaming Services
        </h4>
        <ul className="text-gray-300 text-xs space-y-2">
          <li>
            <strong>TorrentStream:</strong> Best for movies, instant play
          </li>
          <li>
            <strong>BingeAPI:</strong> Good for TV shows, reliable buffering
          </li>
          <li>
            <strong>Stremio + Torrentio:</strong> Full app, better interface
          </li>
        </ul>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2 text-sm">
          ⚠️ Streaming Not Working?
        </h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li>
            <strong>Takes too long:</strong> Some streaming services are slow
          </li>
          <li>
            <strong>No sources found:</strong> This torrent might be too new/old
          </li>
          <li>
            <strong>Buffering issues:</strong> Try downloading instead
          </li>
          <li>
            <strong>Best option:</strong> Use qBittorrent or Transmission to
            download
          </li>
        </ul>
      </div>
    </div>
  );
}
