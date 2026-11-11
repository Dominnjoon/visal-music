
import { Search, X } from "lucide-react";

export default function SearchBar({
  value = "",
  onChange = () => {},
  placeholder = "Search your music...",
}) {
  return (
    <div className="search-field">
      <Search size={19} />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="icon-button clear-search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
