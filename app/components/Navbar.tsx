'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Movie } from '@/types/movie';
import { useMovieStore } from '../store/movieStore';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.results.slice(0, 5) || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMovies, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        useMovieStore.getState().fetchMovies();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        useMovieStore.getState().fetchMovies();
      } else {
        useMovieStore.setState({ movies: [], initialized: false });
      }
    })

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/w200${posterPath}`;
  };

  const handleMovieClick = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
            Sharc 🎬
          </Link>

          <div ref={searchRef} className="flex-1 max-w-2xl mx-8 relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Search movies..."
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-2xl overflow-hidden z-50">
                {loading && (
                  <div className="p-3 text-center text-gray-400 text-sm">
                    Searching...
                  </div>
                )}
                
                {searchResults.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    onClick={handleMovieClick}
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors"
                  >
                    {getPosterUrl(movie.poster_path) ? (
                      <Image
                        src={getPosterUrl(movie.poster_path)!}
                        alt={movie.title}
                        width={60}
                        height={90}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-[60px] h-[90px] bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{movie.title}</p>
                      <p className="text-sm text-gray-400">{movie.release_date?.slice(0, 4)}</p>
                    </div>
                  </Link>
                ))}
                
                {searchQuery && (
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                    className="w-full p-3 text-center text-blue-400 hover:bg-gray-700 transition-colors border-t border-gray-700"
                  >
                    See all results for {searchQuery}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/my-movies"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  My Movies
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}