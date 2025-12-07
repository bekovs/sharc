import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface MovieStore {
  movies: Movie[];
  addMovie: (movie: Movie) => void;
  removeMovie: (id: number) => void;
}

export const useMovieStore = create<MovieStore>()(
  persist(
    (set) => ({
      movies: [],
      addMovie: (movie) => 
        set((state) => ({
          movies: [...state.movies, movie]
        })),
      removeMovie: (id) =>
        set((state) => ({
          movies: state.movies.filter((m) => m.id !== id)
        })),
    }),
    {
      name: 'sharc-movies',
    }
  )
)