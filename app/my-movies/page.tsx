'use client';

import Link from "next/link";
import { useMovieStore } from "../store/movieStore";

export default function MyMoviesPage() {
  const { movies, removeMovie } = useMovieStore();
  console.log(movies)

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

        {movies.length === 0 ? (
          <p className="text-gray-400">No movies added yet. Start searching!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {movie.release_date?.slice(0, 4)}
                </p>
                <button
                  onClick={() => removeMovie(movie.id)}
                  className="w-full px-4 py-2 bg-red-400 hover:bg-red-500 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}