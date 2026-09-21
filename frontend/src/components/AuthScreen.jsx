import { useState } from "react";

import api from "../api";
import styles from "./AuthScreen.module.css";

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
      const res = await api.post(endpoint, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className={styles.screen}>
      <div className={styles.logoBlock}>
        <h1 className={styles.logoTitle}>snapspend</h1>
        <p className={styles.logoSubtitle}>Your photo expense tracker</p>
      </div>

      <div className={styles.form}>
        {mode === "register" && (
          <div className={styles.fieldGap}>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
        )}
        <div className={styles.fieldGap}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <div className={styles.fieldGapLarge}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          onClick={submit}
          disabled={loading}
          className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
        >
          {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className={styles.toggleModeBtn}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
