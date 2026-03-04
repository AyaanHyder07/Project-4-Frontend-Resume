import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /* ── LOGIN ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your username or phone number.");
      return;
    }

    setLoading(true);
    try {
      // login() must return the user object (or store it so we can read it)
      const user = await login(identifier.trim(), password);

      // Redirect based on role
      if (user?.role === "ROLE_ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* ── FORGOT PASSWORD ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter the email or phone linked to your account.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // TODO: wire authAPI.forgotPassword
      setForgotSent(true);
      setError("");
    } catch {
      setError("Could not send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchToForgot = () => {
    setForgotMode(true);
    setError("");
  };
  const switchToLogin = () => {
    setForgotMode(false);
    setForgotSent(false);
    setError("");
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <p className="auth-eyebrow">Resume Portfolio</p>
        <h1>{forgotMode ? "Reset Password" : "Welcome back."}</h1>

        {error && <div className="auth-error">{error}</div>}

        {forgotMode && forgotSent ? (
          <div style={styles.successBox}>
            <p style={styles.successTitle}>Link sent.</p>
            <p style={styles.successBody}>Password reset link sent.</p>
            <button
              onClick={switchToLogin}
              className="btn btn-secondary"
              style={{ marginTop: 24, width: "100%" }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={forgotMode ? handleForgot : handleSubmit} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="identifier">
                Username or Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                className="input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username or +91 9876543210"
                autoComplete="username"
                autoFocus
              />
            </div>

            {!forgotMode && (
              <div className="form-group">
                <div style={styles.labelRow}>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-footer-link"
                    onClick={switchToForgot}
                    tabIndex={-1}
                  >
                    Forgot?
                  </button>
                </div>
                <div style={styles.passWrapper}>
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            )}

            {forgotMode && (
              <p style={styles.hint}>
                Enter the email or phone number associated with your account and
                we'll send a reset link.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: 8 }}
            >
              {loading
                ? forgotMode
                  ? "Sending…"
                  : "Signing in…"
                : forgotMode
                  ? "Send Reset Link"
                  : "Sign In"}
            </button>

            <p className="auth-switch" style={{ marginTop: 20 }}>
              {forgotMode ? (
                <>
                  Remembered it?{" "}
                  <button
                    type="button"
                    onClick={switchToLogin}
                    style={styles.inlineLink}
                  >
                    Back to Sign In
                  </button>
                </>
              ) : (
                <>
                  No account yet? <Link to="/register">Create one</Link>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  passWrapper: { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    padding: 0,
    fontSize: 14,
    cursor: "pointer",
    lineHeight: 1,
    color: "#8A8578",
  },
  hint: { fontSize: 13, color: "#8A8578", lineHeight: 1.6, marginBottom: 16 },
  successBox: { textAlign: "center", padding: "24px 0" },
  successTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 28,
    fontWeight: 400,
    color: "#1C1C1C",
    marginBottom: 10,
  },
  successBody: { fontSize: 14, color: "#8A8578", lineHeight: 1.6 },
  inlineLink: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#1C1C1C",
    fontWeight: 600,
    fontFamily: "inherit",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};
