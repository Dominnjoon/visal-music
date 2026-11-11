
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Music2, User, Mail, Lock, AudioLines } from "lucide-react";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password ត្រូវមានយ៉ាងតិច 6 តួអក្សរ។");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password មិនដូចគ្នាទេ។");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-brand"><span className="brand-mark"><Music2 size={22} /></span><strong>MUSIC LIBRARY</strong></div>
        <div className="auth-art-copy">
          <AudioLines size={34} />
          <h2>Make room<br />for more music.</h2>
          <p>Build a collection that sounds like you.</p>
        </div>
        <div className="auth-art-orbit" aria-hidden="true" />
      </div>
      <div className="auth-form-side">
      <div className="auth-card">

        <div className="auth-heading">
          <div className="auth-mark">
            <Music2 size={32} />
          </div>

          <h1>Create your account</h1>
          <p>
            Start building your music library
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div>
            <label className="field-label">Full name</label>
            <div className="search-field auth-input-wrap">
              <User size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="search-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Email address</label>
            <div className="search-field auth-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="search-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Password</label>
            <div className="search-field auth-input-wrap">
              <Lock size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="search-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Confirm password</label>
            <div className="search-field auth-input-wrap">
              <Lock size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
