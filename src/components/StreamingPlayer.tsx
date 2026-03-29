"use client";

import React from "react";

interface StreamingPlayerProps {
  hash: string;
  name: string;
  magnetLink: string;
}

/**
 * Streaming service component
 * Provides multiple ways to stream torrents online without downloading
 */
export default function StreamingPlayer({
  hash,
  name,
  magnetLink,
}: StreamingPlayerProps) {
  // Validate hash
  const isValidHash = /^[a-f0-9]{40}$/i.test(hash);

  if (!isValidHash) {
    return (
      <div className="bg-red-950 border border-red-700 rounded-lg p-4">
        <p className="text-red-400 text-sm font-semibold">⚠️ Invalid Torrent</p>
        <p className="text-red-300 text-xs mt-1">
          This torrent hash is invalid and cannot be streamed.
        </p>
      </div>
    );
  }

  const streamingServices = [
    {
      id: "torrentio",
      name: "🎬 Torrentio Streaming",
      description: "Direct streaming via Torrentio",
      url: `https://torrentio.strem.fun/stream/${hash}.json`,
      action: () => {
        window.open(
          `https://www.stremio.com/ext/addon?addon=${encodeURIComponent(
            "https://torrentio.strem.fun/manifest.json",
          )}`,
          "_blank",
        );
      },
    },
    {
      id: "realdebrid",
      name: "♾️ Real Debrid",
      description: "Premium cloud streaming (subscription required)",
      url: "#",
      action: () => {
        window.open("https://real-debrid.com", "_blank");
      },
    },
    {
      id: "magnetlink",
      name: "🧲 Copy Magnet Link",
      description: "Copy to clipboard for use with a torrent app",
      url: "#",
      action: async () => {
        try {
          await navigator.clipboard.writeText(magnetLink);
          alert("Magnet link copied to clipboard!");
        } catch {
          alert("Failed to copy magnet link");
        }
      },
    },
  ];

  const torrentioService = streamingServices[0];

  return (
    <div className="w-full space-y-4">
      {/* Torrentio Streaming (Primary) */}
      <div className="bg-gradient-to-r from-green-950 to-green-900 border border-green-700 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-green-400 font-bold mb-1">
              {torrentioService.name}
            </h3>
            <p className="text-green-300 text-xs">
              {torrentioService.description}
            </p>
          </div>
        </div>

        <p className="text-green-200 text-sm mb-3">
          Stream this torrent online using Stremio + Torrentio addon:
        </p>

        <div className="space-y-2">
          <button
            onClick={torrentioService.action}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors text-sm"
          >
            Install Stremio Addon
          </button>

          <p className="text-green-300 text-xs">How to use:</p>
          <ol className="text-green-300 text-xs space-y-1 list-decimal list-inside">
            <li>Install Stremio (free app)</li>
            <li>Add Torrentio addon (click button above)</li>
            <li>Search for content in Stremio</li>
            <li>Select torrent source and stream</li>
          </ol>
        </div>
      </div>

      {/* Alternative Services */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-3 text-sm">
          Other Streaming Options
        </h3>

        <div className="space-y-2">
          {streamingServices.slice(1).map((service) => (
            <button
              key={service.id}
              onClick={service.action}
              className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <p className="text-gray-100 font-semibold text-sm">
                {service.name}
              </p>
              <p className="text-gray-400 text-xs">{service.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Torrent Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2 text-sm">Torrent Details</h4>
        <div className="space-y-2 text-xs">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-gray-200 break-words">{name}</p>
          </div>
          <div>
            <p className="text-gray-400">Hash</p>
            <p className="text-gray-300 font-mono break-all">{hash}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
