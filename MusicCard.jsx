
import { GripVertical, Play, Heart, Trash2 } from "lucide-react";

export default function MusicCard({
  music,
  isFavorite = false,
  onPlay = () => {},
  onFavorite = () => {},
  onDelete = () => {},
  onReorder,
}) {
  if (!music) return null;

  return (
    <article
      className="music-card"
      onDragOver={onReorder ? (event) => event.preventDefault() : undefined}
      onDrop={onReorder ? (event) => {
        event.preventDefault();
        const sourceId = event.dataTransfer.getData("text/plain");
        if (sourceId && sourceId !== music.id) onReorder(sourceId, music.id);
      } : undefined}
    >
      <div className="music-card-art">
        <img
          src={music.thumbnail || "https://placehold.co/400x400/15151d/8b5cf6?text=Music"}
          alt={music.title || "Music thumbnail"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/400x400/15151d/8b5cf6?text=Music";
          }}
        />

        <button
          onClick={() => onPlay(music)}
          aria-label={`Play ${music.title || "music"}`}
          className="card-play-button"
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className="music-card-info">
        <div className="music-card-copy">
          <h3 title={music.title || "Unknown Title"}>
            {music.title || "Unknown Title"}
          </h3>
          <p title={music.artist || "Unknown Artist"}>
            {music.artist || "Unknown Artist"}
          </p>
          {music.duration && <span className="music-duration">{music.duration}</span>}
        </div>

        <div className="music-card-actions">
          {onReorder && (
            <button
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", music.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              aria-label={`Drag ${music.title || "song"} to reorder`}
              title="Drag to reorder"
              className="card-action-button music-sort-handle"
            >
              <GripVertical size={17} />
            </button>
          )}
          <button
            onClick={() => onFavorite(music)}
            aria-label="Toggle favorite"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={`card-action-button${isFavorite ? " is-favorite" : ""}`}
          >
            <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => onDelete(music)}
            aria-label="Delete music"
            title="Delete music"
            className="card-action-button delete-action"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
