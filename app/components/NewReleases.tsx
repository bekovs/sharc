'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/types/movie';

export default function NewReleases() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
        const dateTo = today.toISOString().split('T')[0];

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&primary_release_date.gte=${dateFrom}&primary_release_date.lte=${dateTo}&sort_by=primary_release_date.desc&vote_count.gte=50`
        );
        const data = await res.json();
        setMovies(data.results.slice(0, 20));
      } catch (error) {
        console.error('Error fetching new releases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewReleases();
  }, []);

  const checkArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (movies.length > 0) {
      setTimeout(checkArrows, 100);
    }
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 800;
      const newScrollPosition = 
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w342${posterPath}`;
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">New Releases 🎬</h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">New Releases 🎬</h2>
      
      <div 
        className="relative"
        onMouseEnter={checkArrows}
        onMouseLeave={() => {
          setShowLeftArrow(false);
          setShowRightArrow(false);
        }}
      >
        {showLeftArrow && (
          <button
            onClick={() => {
              scroll('left');
              setTimeout(checkArrows, 300);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-900/90 hover:bg-gray-800 p-3 rounded-full transition-all shadow-lg"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => {
              scroll('right');
              setTimeout(checkArrows, 300);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-900/90 hover:bg-gray-800 p-3 rounded-full transition-all shadow-lg"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkArrows}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="flex-shrink-0 w-44 group/card"
            >
              {getPosterUrl(movie.poster_path) ? (
                <Image
                  src={getPosterUrl(movie.poster_path)!}
                  alt={movie.title}
                  width={176}
                  height={264}
                  className="rounded-lg mb-2 group-hover/card:opacity-75 transition-opacity"
                />
              ) : (
                <div className="w-44 h-64 bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
              
              <h3 className="font-semibold text-sm line-clamp-2 group-hover/card:text-blue-400 transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>{movie.release_date?.slice(0, 4)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  ⭐ {movie.vote_average.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}