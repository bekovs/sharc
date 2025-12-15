'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchMovies = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setMovies(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchMovies();
  }, [query]);

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w342${posterPath}`;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Searching...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Enter a search query to find movies</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">
        Search Results for {query}
      </h1>
      <p className="text-gray-400 mb-8">
        Found {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
      </p>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">No movies found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group"
            >
              {getPosterUrl(movie.poster_path) ? (
                <Image
                  src={getPosterUrl(movie.poster_path)!}
                  alt={movie.title}
                  width={342}
                  height={513}
                  className="w-full rounded-lg mb-2 group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>{movie.release_date?.slice(0, 4)}</span>
                <span>•</span>
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-center py-20"><p className="text-gray-400">Loading...</p></div>}>
          <SearchResults />
        </Suspense>
      </div>
    </main>
  );
}