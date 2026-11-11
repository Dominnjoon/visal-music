
import { useState } from "react";
import { Music2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import MusicCard from "../components/MusicCard";
import AddMusicModal from "../components/AddMusicModal";
import { useMusic } from "../context/MusicContext";

export default function MyLibrary() {
  const {
    music,
    favorites,
    playMusic,
    toggleFavorite,
    deleteMusic,
    addMusic,
    reorderLibrary,
    libraryOrderError,
  } = useMusic();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filteredMusic = music.filter((song) =>
    `${song.title} ${song.artist}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleReorder = (sourceId, targetId) => {
    const sourceIndex = music.findIndex((song) => song.id === sourceId);
    const targetIndex = music.findIndex((song) => song.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;

    const nextMusic = [...music];
    const [movedSong] = nextMusic.splice(sourceIndex, 1);
    nextMusic.splice(sourceIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, movedSong);
    reorderLibrary(nextMusic).catch((error) => {
      console.error("Unable to save library order:", error);
    });
  };

  return (
    <div className="music-app">
      <Sidebar />

      <main className="app-main">
        <Navbar
          title="My Library"
          onSearch={setSearch}
          onAddMusic={() => setShowModal(true)}
        />

        <div className="page-content">
          <div className="page-intro">
            <span className="section-kicker">YOUR COLLECTION</span>
            <h2>My music</h2>
            <p>
              {music.length} songs in your collection
            </p>
          </div>

          <div className="library-search">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search title or artist..."
            />
          </div>

          <p className="library-order-hint">Drag the grip on a track to set your preferred order.</p>
          {libraryOrderError && <p className="form-error library-order-error" role="alert">{libraryOrderError}</p>}

          {filteredMusic.length > 0 ? (
            <div className="music-grid">
              {filteredMusic.map((song) => (
                <MusicCard
                  key={song.id}
                  music={song}
                  isFavorite={favorites.some((item) => item.id === song.id)}
                  onPlay={(song) => playMusic(song, filteredMusic, "library")}
                  onFavorite={toggleFavorite}
                  onDelete={deleteMusic}
                  onReorder={handleReorder}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon"><Music2 size={26} /></span>
              <h3>Your library is empty</h3>
              <p>
                Add music from YouTube to get started.
              </p>
              <button onClick={() => setShowModal(true)} className="button button-primary">Add music</button>
            </div>
          )}
        </div>
      </main>

      <AddMusicModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addMusic}
      />

    </div>
  );
}
