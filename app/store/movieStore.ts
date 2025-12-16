import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { SavedMovie, MovieStatus } from '@/types/movie';

interface MovieStore {
  movies: SavedMovie[];
  loading: boolean;
  initialized: boolean;
  fetchMovies: () => Promise<void>;
  addMovie: (movie: Omit<SavedMovie, 'status' | 'rating'>, status?: MovieStatus) => Promise<void>;
  removeMovie: (id: number) => Promise<void>;
  updateMovieStatus: (id: number, status: MovieStatus) => Promise<void>;
  updateMovieRating: (id: number, rating: number) => Promise<void>;
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  movies: [],
  loading: false,
  initialized: false,

  fetchMovies: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ movies: [], initialized: true });
      return;
    }

    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('user_movies')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const movies: SavedMovie[] = (data || []).map((row) => ({
        id: row.movie_id,
        title: row.title,
        poster_path: row.poster_path,
        release_date: row.release_date,
        vote_average: 0,
        status: row.status as MovieStatus,
        rating: row.rating,
      }));

      set({ movies, initialized: true });
    } catch (error) {
      console.error('Error fetching movies:', error);
      set({ initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  addMovie: async (movie, status = 'watchList') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_movies')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          status,
        });

      if (error) throw error;

      set((state) => ({
        movies: [...state.movies, { ...movie, status }]
      }));
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  },

  removeMovie: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_movies')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', id);

      if (error) throw error;

      set((state) => ({
        movies: state.movies.filter((m) => m.id !== id)
      }));
    } catch (error) {
      console.error('Error removing movie:', error);
    }
  },

  updateMovieStatus: async (id, status) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_movies')
        .update({ status })
        .eq('user_id', user.id)
        .eq('movie_id', id);

      if (error) throw error;

      set((state) => ({
        movies: state.movies.map((m) =>
          m.id === id ? { ...m, status } : m
        )
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  },

  updateMovieRating: async (id, rating) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_movies')
        .update({ rating })
        .eq('user_id', user.id)
        .eq('movie_id', id);

      if (error) throw error;

      set((state) => ({
        movies: state.movies.map((m) =>
          m.id === id ? { ...m, rating } : m
        )
      }));
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  },
}));