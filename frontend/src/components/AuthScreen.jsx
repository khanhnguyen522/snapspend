import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login" ? { email, password } : { email, password, name };
      const res = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        fontFamily: "Inter, sans-serif",
        touchAction: "none",
        overscrollBehavior: "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #000 !important; overflow: hidden; height: 100%; }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-1px",
            marginBottom: 8,
          }}
        >
          snapspend
        </h1>
        <p style={{ fontSize: 14, color: "#444" }}>
          Your photo expense tracker
        </p>
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 360 }}>
        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: "#F87171",
              background: "#7F1D1D22",
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16,
              border: "1px solid #7F1D1D",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)",
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          style={{
            width: "100%",
            marginTop: 16,
            background: "none",
            border: "none",
            color: "#555",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "#111",
  border: "1px solid #1A1A1A",
  borderRadius: 12,
  padding: "14px 16px",
  fontSize: 15,
  color: "#fff",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box",
  display: "block",
};
