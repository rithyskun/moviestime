"use client";

import React, { useState, useRef } from "react";

interface TorrentPlayerProps {
  magnetLink: string;
  fileName?: string;
}

export default function TorrentPlayer({
  magnetLink,
  fileName,
}: TorrentPlayerProps) {
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(magnetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy magnet link");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold mb-4">How to Stream</h2>

        <div className="space-y-4">
          {/* Method 1: Torrent Client */}
          <div className="border border-green-700 bg-green-950 rounded-lg p-4">
            <h3 className="text-green-400 font-bold mb-2">
              ✅ Method 1: Use a Torrent Client (Recommended)
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Open this magnet link in your favorite torrent client:
            </p>
            <button
              onClick={() => {
                window.location.href = magnetLink;
              }}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mb-3"
            >
              🔗 Open in Torrent Client
            </button>
            <p className="text-gray-400 text-xs">
              Popular clients: <strong>qBittorrent</strong>,{" "}
              <strong>Transmission</strong>, <strong>Deluge</strong>,{" "}
              <strong>rTorrent</strong>
            </p>
          </div>

          {/* Method 2: Manual Copy */}
          <div className="border border-blue-700 bg-blue-950 rounded-lg p-4">
            <h3 className="text-blue-400 font-bold mb-2">
              📋 Method 2: Copy Magnet Link
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Copy the magnet link and paste it in your torrent client:
            </p>
            <div className="bg-gray-800 p-3 rounded mb-3 max-h-20 overflow-y-auto">
              <p className="text-gray-300 text-xs break-all font-mono">
                {magnetLink}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              {copied ? "✓ Copied!" : "📋 Copy Magnet Link"}
            </button>
          </div>

          {/* Method 3: Stream Online */}
          <div className="border border-purple-700 bg-purple-950 rounded-lg p-4">
            <h3 className="text-purple-400 font-bold mb-2">
              🌐 Method 3: Stream Online (No Download)
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Use an online torrent streaming service:
            </p>
            <div className="space-y-2">
              <a
                href={`https://torrentsafe.com/?magnetLink=${encodeURIComponent(
                  magnetLink,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-semibold transition-colors text-sm"
              >
                Stream with TorrentSafe
              </a>
              <a
                href={`https://www.torrentmovies.net/?magnet=${encodeURIComponent(
                  magnetLink,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-semibold transition-colors text-sm"
              >
                Stream with MovieBox
              </a>
            </div>
          </div>

          {/* Getting Started */}
          <div className="border border-yellow-700 bg-yellow-950 rounded-lg p-4">
            <h3 className="text-yellow-400 font-bold mb-2">
              🚀 Getting Started (First Time?)
            </h3>
            <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
              <li>
                Download a torrent client (e.g., <strong>qBittorrent</strong> -
                it&apos;s free and open source)
              </li>
              <li>Click &quot;Open in Torrent Client&quot; button above</li>
              <li>
                The torrent will start downloading to your Downloads folder
              </li>
              <li>Open the video file in your favorite video player</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Magnet Link Display */}
      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h3 className="text-white font-bold text-sm mb-2">Torrent Info</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-gray-200 break-words">{fileName || "Torrent"}</p>
          </div>
          <div>
            <p className="text-gray-400">Magnet Link</p>
            <div className="bg-gray-700 p-2 rounded text-xs text-gray-300 break-all">
              {magnetLink}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player (for future use if streaming service is added) */}
      <div className="mt-6 p-4 bg-gray-800 rounded hidden">
        <video
          ref={videoRef}
          controls
          className="w-full bg-black rounded"
          controlsList="nodownload"
          style={{ maxHeight: "600px" }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
