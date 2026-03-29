'use client';

import React from 'react';
import Link from 'next/link';

interface TorrentCardProps {
  id: string;
  name: string;
  seeders: number;
  leechers: number;
  size: string;
  uploadedDate: string;
  category: string;
  hash?: string;
  magnetLink?: string;
}

export default function TorrentCard({
  id,
  name,
  seeders,
  leechers,
  size,
  uploadedDate,
  category,
  hash,
  magnetLink,
}: TorrentCardProps) {
  return (
    <Link href={`/torrent/${hash || id}`}>
      <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700 hover:border-red-600">
        <h3 className="text-white font-semibold text-lg truncate mb-2">{name}</h3>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-400">
          <div>
            <p className="text-gray-500">Category</p>
            <p className="text-white">{category}</p>
          </div>
          <div>
            <p className="text-gray-500">Size</p>
            <p className="text-white">{size}</p>
          </div>
          <div>
            <p className="text-gray-500">Seeders</p>
            <p className="text-green-400 font-semibold">{seeders}</p>
          </div>
          <div>
            <p className="text-gray-500">Leechers</p>
            <p className="text-orange-400 font-semibold">{leechers}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Uploaded: {new Date(uploadedDate).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
