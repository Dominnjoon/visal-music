
import { useState } from "react";
import { Search, Plus, Bell, UserCircle } from "lucide-react";

export default function Navbar({
  title = "Dashboard",
  userName = "Music Lover",
  onSearch = () => {},
  onAddMusic = () => {},
}) {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(search.trim());
  };

  return (
    <header className="app-topbar">
      <div className="topbar-title">
        <span className="eyebrow">YOUR LISTENING SPACE</span>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <form
          onSubmit={handleSearch}
          className="topbar-search"
        >
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search music..."
            aria-label="Search music"
          />
          <kbd>↵</kbd>
        </form>

        <button
          onClick={onAddMusic}
          className="button button-primary add-music-button"
        >
          <Plus size={18} />
          <span>Add music</span>
        </button>

        <button
          aria-label="Notifications"
          className="icon-button notification-button"
        >
          <Bell size={19} />
        </button>

        <div className="topbar-user">
          <UserCircle size={32} />
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}
