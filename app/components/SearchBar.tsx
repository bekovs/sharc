'use client';

import { useState } from 'react';
import { useMovieStore } from '../store/movieStore';
import Image from 'next/image';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { addMovie, movies: savedMovies } = useMovieStore();

  const searchMovies = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${searchQuery}`
      );
      const data = await res.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    searchMovies(value);
  };

  const isMovieSaved = (id: number) => {
    return savedMovies.some((m) => m.id === id);
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w200${posterPath}`;
  };

  return (
    <div className="w-full max-w-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for movies..."
        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {loading && <p className="mt-4 text-gray-400">Searching...</p>}
      
      {movies.length > 0 && (
        <div className="mt-4 space-y-3">
          {movies.slice(0, 5).map((movie) => (
            <div key={movie.id} className="p-3 bg-gray-800 rounded-lg flex gap-4 items-center">
              {getPosterUrl(movie.poster_path) ? (
                <Image
                  src={getPosterUrl(movie.poster_path)!}
                  alt={movie.title}
                  width={80}
                  height={120}
                  className="rounded object-cover"
                />
              ) : (
                <div className="w-[80px] h-[120px] bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                  No image
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{movie.title}</p>
                <p className="text-sm text-gray-400">{movie.release_date?.slice(0, 4)}</p>
              </div>
              <button
                onClick={() => addMovie(movie)}
                disabled={isMovieSaved(movie.id)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  isMovieSaved(movie.id)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isMovieSaved(movie.id) ? 'Added' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}