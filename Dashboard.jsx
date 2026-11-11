
import { useState } from "react";
import { Link } from "react-router-dom";
import { Music2, Heart, ListMusic, Headphones, ArrowRight, Sparkles } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MusicCard from "../components/MusicCard";
import AddMusicModal from "../components/AddMusicModal";
import { useMusic } from "../context/MusicContext";

export default function Dashboard() {
  const {
    music,
    playlists,
    favorites,
    currentMusic,
    playMusic,
    toggleFavorite,
    deleteMusic,
    addMusic,
  } = useMusic();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMusic = music.filter((song) =>
    `${song.title} ${song.artist}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats = [
    { title: "Total Songs", value: music.length, icon: Music2 },
    { title: "Favorites", value: favorites.length, icon: Heart },
    { title: "Playlists", value: playlists.length, icon: ListMusic },
    { title: "Listening", value: currentMusic ? "1" : "0", icon: Headphones },
  ];

  return (
    <div className="music-app">
      <Sidebar />

      <main className="app-main">
        <Navbar
          title="Dashboard"
          onSearch={setSearch}
          onAddMusic={() => setShowModal(true)}
        />

        <div className="page-content dashboard-content">
          <section className="welcome-panel">
            <div className="welcome-copy">
              <span className="welcome-kicker"><Sparkles size={14} /> YOUR MUSIC, YOUR MOMENT</span>
              <h2>Find your next<br />favorite sound.</h2>
              <p>All the music you love, together in one place.</p>
              <button onClick={() => setShowModal(true)} className="button button-light">
                <Music2 size={17} /> Add music
              </button>
            </div>
            {currentMusic && (
              <div className="welcome-feature">
                
                <img
                  src={currentMusic.thumbnail || "https://placehold.co/400x400/15151d/8b5cf6?text=Music"}
                  alt={currentMusic.title || "Now playing"}
                />
                <div>
                  <span>NOW IN ROTATION</span>
                  <strong>{currentMusic.title || "Unknown Title"}</strong>
                  <small>{currentMusic.artist || "Unknown Artist"}</small>
                </div>
              </div>
            )}
          </section>

          <section className="stats-row" aria-label="Library overview">
            {stats.map(({ title, value, icon: Icon }) => (
              <div key={title} className="stat-card">
                <span className="stat-icon"><Icon size={18} /></span>
                <div>
                  <p>{title}</p>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </section>

          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">JUST FOR YOU</span>
                <h2>Recently added</h2>
                <p>Your latest music collection</p>
              </div>
              <Link to="/library" className="text-link">View library <ArrowRight size={16} /></Link>
            </div>

            {filteredMusic.length > 0 ? (
              <div className="music-grid">
                {filteredMusic.slice(0, 8).map((song) => (
                  <MusicCard
                    key={song.id}
                    music={song}
                    isFavorite={favorites.some((item) => item.id === song.id)}
                    onPlay={(song) => playMusic(song, filteredMusic, "library")}
                    onFavorite={toggleFavorite}
                    onDelete={deleteMusic}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><Music2 size={26} /></span>
                <h3>No music found</h3>
                <p>Add a YouTube song to start your library.</p>
                <button onClick={() => setShowModal(true)} className="button button-primary">Add music</button>
              </div>
            )}
          </section>

          {favorites.length > 0 && (
            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">ON REPEAT</span>
                  <h2>Favorite tracks</h2>
                </div>
                <Link to="/favorites" className="text-link">All favorites <ArrowRight size={16} /></Link>
              </div>
              <div className="music-grid">
                {favorites.slice(0, 4).map((song) => (
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
            </section>
          )}

          {playlists.length > 0 && (
            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">MADE BY YOU</span>
                  <h2>Your playlists</h2>
                </div>
                <Link to="/playlists" className="text-link">All playlists <ArrowRight size={16} /></Link>
              </div>
              <div className="playlist-grid">
                {playlists.slice(0, 3).map((playlist) => (
                  <div key={playlist.id} className="dashboard-playlist">
                    <ListMusic size={19} />
                    <div><strong>{playlist.name || "Untitled Playlist"}</strong><span>{playlist.musicCount ?? playlist.songs?.length ?? 0} songs</span></div>
                    <Link to="/playlists" aria-label={`View ${playlist.name || "playlist"}`}><ArrowRight size={17} /></Link>
                  </div>
                ))}
              </div>
            </section>
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
