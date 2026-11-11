import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Library, Heart, ListMusic,
  Settings, LogOut, Music2
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const menuItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "My Library", path: "/library", icon: Library },
  { name: "Favorites", path: "/favorites", icon: Heart },
  { name: "Playlists", path: "/playlists", icon: ListMusic },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderLinks = (className) => menuItems.map(({ name, path, icon: Icon }) => (
    <NavLink
      key={path}
      to={path}
      end={path === "/"}
      aria-label={name}
      className={({ isActive }) => `${className}__link${isActive ? " is-active" : ""}`}
    >
      <Icon size={20} strokeWidth={1.8} />
      <span>{name}</span>
    </NavLink>
  ));

  return (
    <>
      <aside className="app-sidebar">
        <NavLink to="/" className="brand-lockup" aria-label="Music Library home">
          <span className="brand-mark"><img src="/sal.jpg" alt="Music Library"   
  className="w-10 h-10 rounded-full object-cover" /></span>
          <span className="brand-copy">
            <strong>MUSIC LIBRARY</strong>
            <small>Your personal music space</small>
          </span>
        </NavLink>

        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="sidebar-nav">{renderLinks("sidebar-nav")}</nav>

        <div className="sidebar-account">
          <div className="account-avatar">
            {(auth.currentUser?.displayName || auth.currentUser?.email || "M").charAt(0).toUpperCase()}
          </div>
          <div className="account-copy">
            <strong>{auth.currentUser?.displayName || "Music Lover"}</strong>
            <small>{auth.currentUser?.email || "Your account"}</small>
          </div>
          <button onClick={handleLogout} className="logout-button" aria-label="Logout" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <nav className="mobile-nav" aria-label="Main navigation">
        {renderLinks("mobile-nav")}
      </nav>
    </>
  );
}
