'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TorrentPlayerProps {
  magnetLink: string;
  fileName?: string;
}

export default function TorrentPlayer({ magnetLink, fileName }: TorrentPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [torrentInfo, setTorrentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadTorrent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stream/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnetLink }),
      });

      if (!response.ok) throw new Error('Failed to load torrent');

      const data = await response.json();
      if (data.success) {
        setTorrentInfo(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold mb-4">Torrent Player</h2>

        <div className="mb-4 p-4 bg-gray-800 rounded">
          <p className="text-gray-300 text-sm break-all">Magnet: {magnetLink}</p>
        </div>

        <button
          onClick={loadTorrent}
          disabled={isLoading}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Load Torrent'}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {torrentInfo && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-white text-xl font-bold mb-4">{torrentInfo.name}</h3>

          <div className="grid grid-cols-2 gap-4 mb-6 text-gray-300 text-sm">
            <div>
              <p className="text-gray-400">Hash:</p>
              <p className="break-all">{torrentInfo.infoHash}</p>
            </div>
            <div>
              <p className="text-gray-400">Progress:</p>
              <p>{(torrentInfo.progress * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-gray-400">Downloaded:</p>
              <p>{(torrentInfo.downloaded / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div>
              <p className="text-gray-400">Files:</p>
              <p>{torrentInfo.files?.length || 0}</p>
            </div>
          </div>

          {torrentInfo.files && torrentInfo.files.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3">Files</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {torrentInfo.files.map((file: any) => (
                  <div
                    key={file.index}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    <p className="text-gray-300 text-sm break-all">{file.name}</p>
                    <p className="text-gray-400 text-xs">
                      {(file.length / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-800 rounded">
        <video
          ref={videoRef}
          controls
          className="w-full bg-black rounded"
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
