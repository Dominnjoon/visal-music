
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Music2, Mail, Lock, AudioLines } from "lucide-react";
import { signIn } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-brand"><span className="brand-mark"><img src="/sal.jpg" alt="Music Library"   
  className="w-10 h-10 rounded-full object-cover" /></span><strong>MUSIC LIBRARY</strong></div>
        <div className="auth-art-copy">
          <AudioLines size={34} />
          <h2>Your music<br />finds a home.</h2>
          <p>Every favorite. Every mood. All in one place.</p>
        </div>
        <div className="auth-art-orbit" aria-hidden="true" />
      </div>
      <div className="auth-form-side">
      <div className="auth-card">

        <div className="auth-heading">
          <div className="auth-mark">
          <img src="/sal.jpg" alt="Music Library"   
  className="w-11 h-11 rounded-full object-cover" />
          </div>

          <h1>Welcome back</h1>
          <p>
            Sign in to your music library
          </p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div>
            <label className="field-label">
              Email Address
            </label>

            <div className="search-field auth-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="search-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              Password
            </label>

            <div className="search-field auth-input-wrap">
              <Lock size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="search-input"
              />
            </div>
          </div>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-primary auth-submit"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
