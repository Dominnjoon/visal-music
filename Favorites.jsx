
import { Heart } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MusicCard from "../components/MusicCard";
import { useMusic } from "../context/MusicContext";

export default function Favorites() {
  const {
    favorites,
    playMusic,
    toggleFavorite,
    deleteMusic,
  } = useMusic();

  return (
    <div className="music-app">
      <Sidebar />

      <main className="app-main">
        <Navbar title="Favorites" />

        <div className="page-content">
          <div className="page-intro">
            <span className="section-kicker">THE ON-REPEAT LIST</span>
            <h2><Heart size={24} className="heading-icon" fill="currentColor" /> Your favorites</h2>
            <p>
                {favorites.length} favorite songs
            </p>
          </div>

          {favorites.length > 0 ? (
            <div className="music-grid">
              {favorites.map((song) => (
                <MusicCard
                  key={song.id}
                  music={song}
                  isFavorite
                  onPlay={(song) => playMusic(song, favorites, "custom")}
                  onFavorite={toggleFavorite}
                  onDelete={deleteMusic}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon"><Heart size={26} /></span>
              <h3>No favorite songs yet</h3>
              <p>
                Press the heart icon on a song to add it here.
              </p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
