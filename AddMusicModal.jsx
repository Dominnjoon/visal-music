
import { useState } from "react";
import { X, Play, Link, Plus } from "lucide-react";

export default function AddMusicModal({
  isOpen = false,
  onClose = () => {},
  onAdd = () => {},
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setLoading(true);

    try {
      await onAdd(url.trim());
      setUrl("");
      onClose();
    } catch (err) {
      setError(err.message || "Unable to add music.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">

        <div className="modal-heading">
          <div className="modal-title-group">
            <div className="modal-icon">
              <Play size={23} />
            </div>
            <div>
              <h2>Add music</h2>
              <p>Add from YouTube</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="icon-button"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-label">
            YouTube Video URL
          </label>

          <div className="search-field modal-input-wrap">
            <Link size={18} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="search-input"
              required
            />
          </div>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="button button-primary"
            >
              <Plus size={18} />
              {loading ? "Adding..." : "Add Music"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
