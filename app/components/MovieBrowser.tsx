'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface Genre {
  id: number;
  name: string;
}

type SortBy = 'vote_average.desc' | 'primary_release_date.desc' | 'title.asc';

export default function MovieBrowser() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('vote_average.desc');
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await res.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const fetchMovies = async (pageNum: number, reset = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      let url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${pageNum}&sort_by=${sortBy}&vote_count.gte=500`;
      
      if (selectedGenre) {
        url += `&with_genres=${selectedGenre}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (reset) {
        setMovies(data.results);
      } else {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = data.results.filter((movie: Movie) => !existingIds.has(movie.id));
          return [...prev, ...newMovies];
        });
      }
      
      setHasMore(pageNum < data.total_pages);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMovies(1, true);
  }, [sortBy, selectedGenre]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchMovies(nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore]);

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w342${posterPath}`;
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">All Movies</h2>

      <div className="mb-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vote_average.desc">Rating (High to Low)</option>
              <option value="primary_release_date.desc">Release Date (Newest)</option>
              <option value="title.asc">Title (A-Z)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Genre:</label>
            <select
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

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

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading more movies...</p>
        </div>
      )}

      <div ref={observerTarget} className="h-20" />

      {!hasMore && movies.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No more movies to load</p>
        </div>
      )}
    </div>
  );
}