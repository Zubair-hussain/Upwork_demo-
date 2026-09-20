"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * PlusBanner
 * ----------
 * A faithful re-creation of the "Freelancer Plus with new perks" carousel that
 * Upwork shows at the top of the freelancer dashboard. It rotates through three
 * marketing slides, exactly like the real product:
 *
 *   1. 100 monthly Connects + full access to Uma (Upwork's Mindful AI).
 *   2. Competitor bid insights so you know how to price a proposal.
 *   3. Keep your profile visible + a custom profile URL while you take a break.
 *
 * Every visual moment here is animated on purpose:
 *   - The headline + eyebrow slide-and-fade in each time the slide changes.
 *   - The illustration gently floats up and down forever.
 *   - The progress bars at the bottom fill left-to-right over the slide's life.
 *   - A play/pause control lets the user freeze the rotation (accessibility).
 *
 * The rotation auto-advances every 6 seconds and honours prefers-reduced-motion
 * by pausing automatically for users who ask the OS for less motion.
 */

type Slide = {
  eyebrow: string;
  title: string;
  cta: string;
  /** Emoji stand-in for the Upwork illustration so no external asset is needed. */
  art: string;
};

const slides: Slide[] = [
  {
    eyebrow: "Freelancer Plus with new perks",
    title: "100 monthly Connects and full access to Uma, Upwork's Mindful AI.",
    cta: "Learn more",
    art: "🧗"
  },
  {
    eyebrow: "Freelancer Plus with new perks",
    title: "See competitor bids so you can price every proposal with confidence.",
    cta: "Learn more",
    art: "📊"
  },
  {
    eyebrow: "Freelancer Plus with new perks",
    title: "Keep your profile visible and claim a custom URL, even on a break.",
    cta: "Learn more",
    art: "🌴"
  }
];

const SLIDE_MS = 6000;

export function PlusBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance the carousel unless the user paused it or asked for less motion.
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (paused || reduce) {
      return;
    }

    timer.current = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_MS);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [paused]);

  const slide = slides[index];

  return (
    <section className="plus-banner" aria-roledescription="carousel" aria-label="Freelancer Plus perks">
      <div className="plus-banner-copy">
        {/* key={index} restarts the slide-in animation on every slide change. */}
        <p className="plus-eyebrow" key={`eyebrow-${index}`}>
          {slide.eyebrow}
        </p>
        <h2 className="plus-title" key={`title-${index}`}>
          {slide.title}
        </h2>
        <button className="plus-cta" type="button">
          {slide.cta}
        </button>
      </div>

      <div className="plus-banner-art" aria-hidden="true">
        <span className="plus-art-emoji" key={`art-${index}`}>
          {slide.art}
        </span>
      </div>

      <div className="plus-controls">
        <button
          className="plus-play"
          type="button"
          aria-label={paused ? "Play carousel" : "Pause carousel"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div className="plus-dots" role="tablist">
          {slides.map((item, dotIndex) => (
            <button
              key={item.title}
              className={`plus-dot ${dotIndex === index ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Show perk ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
            >
              <span
                className="plus-dot-fill"
                // The fill animates only on the active dot, and freezes when paused.
                style={{
                  animationDuration: `${SLIDE_MS}ms`,
                  animationPlayState: paused ? "paused" : "running"
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
