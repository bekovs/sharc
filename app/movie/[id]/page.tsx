'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMovieStore } from '../../store/movieStore';
import type { MovieDetails, MovieStatus } from '@/types/movie';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { movies: savedMovies, addMovie, removeMovie, updateMovieStatus, updateMovieRating } = useMovieStore();
  
  const savedMovie = savedMovies.find((m) => m.id === Number(params.id));

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <p className="text-gray-400">Movie not found</p>
      </main>
    );
  }

  const getPosterUrl = (path: string | null) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w500${path}`;
  };

  const getBackdropUrl = (path: string | null) => {
    if (!path) return null;
    const url = `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w1280${path}`;
    console.log('Generated backdrop URL:', url);
    return url;
  };

  const handleAddMovie = (status: MovieStatus) => {
    addMovie({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    }, status);
  };

  const handleRatingClick = (rating: number) => {
    if (savedMovie) {
      updateMovieRating(movie.id, rating);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {movie.backdrop_path && (
        <div className="absolute top-0 left-0 w-full h-[500px] z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getBackdropUrl(movie.backdrop_path)!}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950" />
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-8 pb-16">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* poster */}
          <div className="flex-shrink-0">
            {getPosterUrl(movie.poster_path) ? (
              <Image
                src={getPosterUrl(movie.poster_path)!}
                alt={movie.title}
                width={300}
                height={450}
                className="rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-[300px] h-[450px] bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No poster</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <span>{movie.release_date?.slice(0, 4)}</span>
              <span>•</span>
              <span>{movie.runtime} min</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
            </div>

            {/* Жанры */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>

            {!savedMovie ? (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Add to:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddMovie('watchList')}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm transition-colors"
                  >
                    📋 Watchlist
                  </button>
                  <button
                    onClick={() => handleAddMovie('watching')}
                    className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-sm transition-colors"
                  >
                    ▶️ Watching
                  </button>
                  <button
                    onClick={() => handleAddMovie('watched')}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-sm transition-colors"
                  >
                    ✓ Watched
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {/* status */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm text-gray-400">Status:</span>
                  <button
                    onClick={() => updateMovieStatus(movie.id, 'watchList')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      savedMovie.status === 'watchList'
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    📋 Watchlist
                  </button>
                  <button
                    onClick={() => updateMovieStatus(movie.id, 'watching')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      savedMovie.status === 'watching'
                        ? 'bg-yellow-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    ▶️ Watching
                  </button>
                  <button
                    onClick={() => updateMovieStatus(movie.id, 'watched')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      savedMovie.status === 'watched'
                        ? 'bg-green-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    ✓ Watched
                  </button>
                  <button
                    onClick={() => removeMovie(movie.id)}
                    className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {/* rating */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Your rating:</p>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        className={`w-9 h-9 rounded transition-colors ${
                          savedMovie.rating && star <= savedMovie.rating
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                  {savedMovie.rating && (
                    <p className="text-sm text-gray-400 mt-2">
                      You rated this movie {savedMovie.rating}/10
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}