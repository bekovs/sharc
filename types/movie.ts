export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface MovieDetails {
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

export type MovieStatus = 'watchList' | 'watching' | 'watched';

export interface SavedMovie extends Movie {
  status: MovieStatus;
  rating?: number;
}