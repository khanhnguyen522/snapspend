import { useEffect } from "react";

import styles from "./Toast.module.css";

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, []);

  return <div className={styles.toast}>{msg}</div>;
}
