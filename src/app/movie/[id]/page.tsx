"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface MovieDetail {
  _id: string;
  title: string;
  description?: string;
  genre?: string[];
  rating?: number;
  posterUrl?: string;
  releaseDate?: string;
  duration?: number;
  torrentHash?: string;
}

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movies/${encodeURIComponent(id)}`);
        const data = await response.json();
        if (data.success) {
          setMovie(data.data);
        } else {
          setError("Movie not found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="text-red-500">{error || "Movie not found"}</p>
        <Link href="/" className="text-red-600 hover:text-red-500">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-b from-gray-900 to-transparent border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white truncate">
            {movie.title}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Poster */}
          <div>
            {movie.posterUrl ? (
              <div className="relative h-96 rounded-lg overflow-hidden border border-gray-700">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                No Poster
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                      {movie.rating}/10
                    </div>
                  </div>
                )}
                {movie.releaseDate && (
                  <p className="text-gray-400">
                    Released: {new Date(movie.releaseDate).getFullYear()}
                  </p>
                )}
                {movie.duration && (
                  <p className="text-gray-400">{movie.duration} minutes</p>
                )}
              </div>
            </div>

            {movie.genre && movie.genre.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-sm font-semibold mb-3">
                  GENRES
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.description && (
              <div>
                <h2 className="text-gray-400 text-sm font-semibold mb-3">
                  SYNOPSIS
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>
            )}

            {movie.torrentHash && (
              <div>
                <Link
                  href={`/torrent/${movie.torrentHash}`}
                  className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                >
                  Watch Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
