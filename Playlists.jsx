
import { useState } from "react";
import {
  ListMusic,
  Plus,
  X,
  Music2,
  Save,
  CheckSquare,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PlaylistCard from "../components/PlaylistCard";
import { useMusic } from "../context/MusicContext";

export default function Playlists() {
  const {
    music,
    playlists,
    createPlaylist,
    deletePlaylist,
    playMusic,
    updatePlaylistSongs,
  } = useMusic();

  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [error, setError] = useState("");

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!playlistName.trim()) {
      setError("Please enter a playlist name.");
      return;
    }

    try {
      await createPlaylist(playlistName.trim());
      setPlaylistName("");
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to create playlist.");
    }
  };

  // Open playlist manager
  const handleManage = (playlist) => {
    setSelectedPlaylist(playlist);

    const existingIds = (playlist.songs || []).map(
      (song) => song.id
    );

    setSelectedSongIds(existingIds);
  };

  // Select / Unselect song
  const toggleSong = (songId) => {
    setSelectedSongIds((previous) =>
      previous.includes(songId)
        ? previous.filter((id) => id !== songId)
        : [...previous, songId]
    );
  };

  // Select all songs
  const handleSelectAll = () => {
    if (selectedSongIds.length === music.length) {
      setSelectedSongIds([]);
    } else {
      setSelectedSongIds(music.map((song) => song.id));
    }
  };

  // Save selected songs
  const handleSaveSongs = async () => {
    if (!selectedPlaylist) return;

    setSaving(true);
    setError("");

    try {
      const selectedSongs = selectedSongIds
        .map((id) => music.find((song) => song.id === id))
        .filter(Boolean);

      await updatePlaylistSongs(
        selectedPlaylist.id,
        selectedSongs
      );

      setSelectedPlaylist(null);
      setSelectedSongIds([]);

    } catch (err) {
      setError(err.message || "Unable to save songs.");
    } finally {
      setSaving(false);
    }
  };

  // Play playlist
  const handleOpen = (playlist) => {
    if (playlist.songs?.length > 0) {
      playMusic(
        playlist.songs[0],
        playlist.songs,
        "custom"
      );
    } else {
      alert("This playlist is empty.");
    }
  };

  // Delete playlist
  const handleDelete = async (playlist) => {
    const confirmed = window.confirm(
      `Delete playlist "${playlist.name}"?`
    );

    if (confirmed) {
      await deletePlaylist(playlist.id);
    }
  };

  return (
    <div className="music-app">
      <Sidebar />

      <main className="app-main">
        <Navbar title="Playlists" />

        <div className="page-content">

          {/* Header */}
          <div className="page-intro playlist-intro">
            <div>
              <span className="section-kicker">
                YOUR PERSONAL MIXES
              </span>

              <h2>Your playlists</h2>

              <p>Organize your favorite music</p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="button button-primary"
            >
              <Plus size={18} />
              Create Playlist
            </button>
          </div>

          {/* Create Playlist Form */}
          {showForm && (
            <div className="playlist-form-card">
              <div className="form-card-heading">
                <h3>New playlist</h3>

                <button
                  onClick={() => setShowForm(false)}
                  className="icon-button"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) =>
                    setPlaylistName(e.target.value)
                  }
                  placeholder="Enter playlist name"
                  className="text-field"
                  required
                />

                {error && (
                  <p className="form-error">{error}</p>
                )}

                <button
                  type="submit"
                  className="button button-primary form-submit"
                >
                  Save Playlist
                </button>
              </form>
            </div>
          )}

          {/* Playlist Collection */}
          {playlists.length > 0 ? (
            <div className="playlist-grid playlist-collection">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onOpen={handleOpen}
                  onDelete={handleDelete}
                  onManage={handleManage}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <ListMusic size={26} />
              </span>

              <h3>No playlists yet</h3>

              <p>
                Create your first playlist to organize your songs.
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Add Songs Modal */}
      {selectedPlaylist && (
        <div className="playlist-modal-overlay">
          <div className="playlist-modal">

            <div className="playlist-modal-header">
              <div>
                <span className="section-kicker">
                  MANAGE PLAYLIST
                </span>

                <h2>{selectedPlaylist.name}</h2>

                <p>
                  Select songs from your My Library.
                </p>
              </div>

              <button
                onClick={() => setSelectedPlaylist(null)}
                className="icon-button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="playlist-select-toolbar">
              <span>
                {selectedSongIds.length} / {music.length} selected
              </span>

              <button
                onClick={handleSelectAll}
                className="playlist-select-all"
                disabled={music.length === 0}
              >
                <CheckSquare size={16} />
                {selectedSongIds.length === music.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {/* Song List */}
            <div className="playlist-song-list">

              {music.length > 0 ? (
                music.map((song) => {
                  const checked = selectedSongIds.includes(
                    song.id
                  );

                  return (
                    <label
                      key={song.id}
                      className={`playlist-song-option ${
                        checked ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSong(song.id)}
                      />

                      <img
                        src={
                          song.thumbnail ||
                          "https://placehold.co/60x60/15151d/8b5cf6?text=Music"
                        }
                        alt={song.title}
                      />

                      <div className="playlist-song-details">
                        <h4>{song.title}</h4>
                        <p>{song.artist || "Unknown Artist"}</p>
                      </div>

                      {checked && (
                        <span className="playlist-selected-mark">
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })
              ) : (
                <div className="empty-state">
                  <Music2 size={32} />

                  <h3>No music in your library</h3>

                  <p>
                    Add songs from YouTube to My Library first.
                  </p>
                </div>
              )}

            </div>

            {error && (
              <p className="form-error">{error}</p>
            )}

            {/* Footer */}
            <div className="playlist-modal-footer">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="button button-secondary"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSongs}
                className="button button-primary"
                disabled={saving}
              >
                <Save size={17} />

                {saving ? "Saving..." : "Save Songs"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
