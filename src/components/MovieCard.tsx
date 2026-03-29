'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface MovieCardProps {
  id: string;
  title: string;
  description?: string;
  genre?: string[];
  rating?: number;
  posterUrl?: string;
  releaseDate?: string;
}

export default function MovieCard({
  id,
  title,
  description,
  genre,
  rating,
  posterUrl,
  releaseDate,
}: MovieCardProps) {
  return (
    <Link href={`/movie/${id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer border border-gray-700 hover:border-red-600">
        <div className="relative h-64 bg-gray-700">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {rating && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
              {rating}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-white font-semibold truncate mb-2">{title}</h3>

          {genre && genre.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {genre.slice(0, 2).map((g) => (
                <span key={g} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {g}
                </span>
              ))}
            </div>
          )}

          {releaseDate && (
            <p className="text-xs text-gray-400">
              {new Date(releaseDate).getFullYear()}
            </p>
          )}

          {description && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
