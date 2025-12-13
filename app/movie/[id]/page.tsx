'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  overview: string;
  genres: { id: number; name: string }[];
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);

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
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w1280${path}`;
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Backdrop */}
      {movie.backdrop_path && (
        <div className="relative w-full h-96 mb-8">
          <Image
            src={getBackdropUrl(movie.backdrop_path)!}
            alt={movie.title}
            fill
            className="object-cover opacity-30"
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 -mt-64 relative z-10">
        <Link 
          href="/my-movies" 
          className="inline-block mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
        >
          ← Back
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
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
              <div className="w-[300px] h-[450px] bg-gray-700 rounded-lg flex items-center justify-center">
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

            <div className="flex gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}