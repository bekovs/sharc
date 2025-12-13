import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MovieStatus = 'watchList' | 'watching' | 'watched';
interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  status: MovieStatus;
  rating?: number;
}

interface MovieStore {
  movies: Movie[];
  addMovie: (movie: Omit<Movie, 'status' | 'rating'>, status?: MovieStatus) => void;
  removeMovie: (id: number) => void;
  updateMovieStatus: (id: number, status: MovieStatus) => void;
  updateMovieRating: (id: number, rating: number) => void;
}

export const useMovieStore = create<MovieStore>()(
  persist(
    (set) => ({
      movies: [],
      addMovie: (movie, status = 'watchList') => 
        set((state) => ({
          movies: [...state.movies, { ...movie, status }]
        })),
      removeMovie: (id) =>
        set((state) => ({
          movies: state.movies.filter((m) => m.id !== id)
        })),
      updateMovieStatus: (id, status) => 
        set((state) => ({
          movies: state.movies.map((m) => 
            m.id === id ? { ...m, status } : m
          )
        })),
      updateMovieRating: (id, rating) => 
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === id ? { ...m, rating } : m
          )
        })),
    }),
    {
      name: 'sharc-movies',
    }
  )
)