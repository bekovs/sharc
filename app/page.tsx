import Link from "next/link";
import SearchBar from "./components/SearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Sharc 🎬</h1>
          <Link 
            href="/my-movies" 
            className="px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded"
          >
            My Movies
          </Link>
        </div>
        <SearchBar />
      </div>
    </main>
  )
}