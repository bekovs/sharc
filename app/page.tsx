import SearchBar from "./components/SearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">sharc 🎬</h1>
        <SearchBar />
      </div>
    </main>
  )
}