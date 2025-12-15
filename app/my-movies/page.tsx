'use client';

import { useMovieStore, MovieStatus } from '../store/movieStore';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';

export default function MyMoviesPage() {
  const { movies, removeMovie } = useMovieStore();
  
  const [activeTab, setActiveTab] = useState<MovieStatus>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('activeMovieTab');
      return (saved as MovieStatus) || 'watchList';
    }
    return 'watchList';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating'>('title');

  useEffect(() => {
    sessionStorage.setItem('activeMovieTab', activeTab);
  }, [activeTab]);

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w342${posterPath}`;
  };

  // Фильтруем и сортируем фильмы
  const filteredMovies = useMemo(() => {
    let result = movies.filter((m) => m.status === activeTab);

    // Поиск по названию
    if (searchQuery) {
      result = result.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Сортировка
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'year') {
        return (b.release_date || '').localeCompare(a.release_date || '');
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return result;
  }, [movies, activeTab, searchQuery, sortBy]);

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
        <div className="flex gap-2 mb-6">
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

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your movies..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'year' | 'rating')}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="title">Sort by Title</option>
            <option value="year">Sort by Year</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        {filteredMovies.length === 0 ? (
          <p className="text-gray-400">
            {searchQuery ? 'No movies found matching your search.' : 'No movies in this category yet.'}
          </p>
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
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>{movie.release_date?.slice(0, 4)}</span>
                    {movie.rating && (
                      <span className="text-yellow-500">★ {movie.rating}</span>
                    )}
                  </div>
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