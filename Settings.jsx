
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { User, Mail, Save, Music2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { auth } from "../services/firebase";

export default function Settings() {
  const user = auth.currentUser;

  const [name, setName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setError("Please login first.");
      return;
    }

    setLoading(true);

    try {
      await updateProfile(user, {
        displayName: name.trim(),
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="music-app">
      <Sidebar />

      <main className="app-main">
        <Navbar title="Settings" userName={name || "Music Lover"} />

        <div className="page-content settings-content">
          <div className="page-intro">
            <span className="section-kicker">PREFERENCES</span>
            <h2>Account settings</h2>
            <p>
              Manage your personal information.
            </p>
          </div>

          <div className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <User size={25} />
              </div>
              <div>
                <h3>Profile information</h3>
                <p>
                  Update your account profile
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="settings-form">
              <div>
                <label className="field-label">
                  Display Name
                </label>

                <div className="search-field settings-input-wrap">
                  <User size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="search-input"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">
                  Email Address
                </label>

                <div className="search-field settings-input-wrap">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="search-input"
                  />
                </div>
                <p                 className="field-hint">
                  Email address cannot be changed here.
                </p>
              </div>

              {message && (
                <p className="form-success">
                  {message}
                </p>
              )}

              {error && (
                <p className="form-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="button button-primary"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="settings-brand-card">
            <div className="flex items-center gap-3">
              <Music2 size={24} />
              <div>
                <h3>V-Music Library</h3>
                <p>
                  Your music. Your library. Anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
