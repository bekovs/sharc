import MovieBrowser from './components/MovieBrowser';
import NewReleases from './components/NewReleases';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewReleases />
        
        <MovieBrowser />
      </div>
    </main>
  );
}