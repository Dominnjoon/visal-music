import {
  Play,
  ListMusic,
  Trash2,
  Plus,
} from "lucide-react";

export default function PlaylistCard({
  playlist,
  onOpen = () => {},
  onDelete = () => {},
  onManage = () => {},
}) {
  if (!playlist) return null;

  return (
    <article className="playlist-card">
      <div className="playlist-card-art">
        {playlist.thumbnail ? (
          <img
            src={playlist.thumbnail}
            alt={playlist.name || "Playlist"}
            loading="lazy"
          />
        ) : (
          <ListMusic size={42} />
        )}

        <button
          onClick={() => onOpen(playlist)}
          aria-label="Open playlist"
          className="card-play-button"
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className="playlist-card-info">
        <div>
          <h3>
            {playlist.name || "Untitled Playlist"}
          </h3>

          <p>
            {playlist.songs?.length || 0} songs
          </p>
        </div>

        <button
          onClick={() => onDelete(playlist)}
          aria-label="Delete playlist"
          className="card-action-button delete-action"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="playlist-card-actions">
        <button
          onClick={() => onManage(playlist)}
          className="button button-primary"
        >
          <Plus size={16} />
          Add Songs
        </button>
      </div>
    </article>
  );
}