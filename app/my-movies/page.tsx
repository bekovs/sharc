'use client';

import { useMovieStore, MovieStatus } from '../store/movieStore';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function MyMoviesPage() {
  const { movies, removeMovie } = useMovieStore();
  const [activeTab, setActiveTab] = useState<MovieStatus>('watchList');

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w342${posterPath}`;
  };

  const filteredMovies = movies.filter((m) => m.status === activeTab);

  const tabs = [
    { id: 'watchList' as MovieStatus, label: 'Want to Watch', icon: '📋' },
    { id: 'watching' as MovieStatus, label: 'Watching', icon: '▶️' },
    { id: 'watched' as MovieStatus, label: 'Watched', icon: '✓' },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Movies 🎬</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            ← Back to Search
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.icon} {tab.label} ({movies.filter((m) => m.status === tab.id).length})
            </button>
          ))}
        </div>

        {filteredMovies.length === 0 ? (
          <p className="text-gray-400">No movies in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden group">
                <Link href={`/movie/${movie.id}`}>
                  {getPosterUrl(movie.poster_path) ? (
                    <Image
                      src={getPosterUrl(movie.poster_path)!}
                      alt={movie.title}
                      width={342}
                      height={513}
                      className="w-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/movie/${movie.id}`}>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-blue-400 transition-colors">
                      {movie.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-3">
                    {movie.release_date?.slice(0, 4)}
                  </p>
                  <button
                    onClick={() => removeMovie(movie.id)}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}