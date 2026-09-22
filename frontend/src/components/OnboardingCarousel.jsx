import { useState } from "react";

import styles from "./OnboardingCarousel.module.css";

const SLIDES = [
  {
    icon: "📸",
    title: "Snap it, don't type it",
    text: "Take a photo of any receipt and Claude reads the amount, store, and date for you — skip the manual entry.",
  },
  {
    icon: "🪣",
    title: "Buckets, your way",
    text: "Create your own spending categories — Rent, Coffee, whatever fits your life — and give each one a monthly budget.",
  },
  {
    icon: "📊",
    title: "See where it all goes",
    text: "Your calendar and Overview tab show exactly how much you've spent and how much budget you have left, at a glance.",
  },
];

export default function OnboardingCarousel({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  return (
    <div className={styles.screen}>
      <div className={styles.skipRow}>
        <button onClick={onDone} className={styles.skipBtn}>
          Skip
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.icon}>{slide.icon}</div>
        <p className={styles.title}>{slide.title}</p>
        <p className={styles.text}>{slide.text}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ""}`}
            />
          ))}
        </div>
        <button
          onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
          className={styles.nextBtn}
        >
          {isLast ? "Get started" : "Next"}
        </button>
      </div>
    </div>
  );
}
