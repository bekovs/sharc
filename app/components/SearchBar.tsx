'use client';

import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${searchQuery}`
      )
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

  return (
    <div className="w-full max-w-2xl">
      <input 
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for the movies..."
        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && <p className="mt-4 text-gray-400">Searching...</p>}

      {movies.length > 0 && (
        <div className="mt-4 space-y-2">
          {movies.slice(0, 5).map((movie) => (
            <div key={movie.id} className="p-3 bg-gray-800 rounded">
              <p className="font-semibold">{movie.title}</p>
              <p className="text-sm text-gray-400">{movie.release_date?.slice(0, 4)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}