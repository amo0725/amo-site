"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ReelCopy } from "@/content/types";
import { cn } from "@/lib/cn";
import { useMotionPreference } from "@/lib/motion/preference";
import { MakingOf } from "./making-of";
import type { ReelControls } from "./reel-stage";
import { DURATION } from "./timing";

const ReelStage = dynamic(() => import("./reel-stage"), { ssr: false });

type Status = "idle" | "playing" | "paused" | "ended";

function timecode(t: number): string {
  const s = Math.floor(t);
  return `00:${String(s).padStart(2, "0")}`;
}

/**
 * Player chrome around the stage: play/pause, scrubber, chapters, full
 * screen. It autoplays when mostly in view (unless the visitor turned
 * motion off), pauses when scrolled away, and loads the stage only when
 * the reel gets close to the viewport.
 */
export function ReelPlayer({ copy }: { copy: ReelCopy }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const playheadRef = useRef<HTMLSpanElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const [intro, setIntro] = useState(false);
  const statusRef = useRef<Status>("idle");
  const controls = useRef<ReelControls | null>(null);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [chapter, setChapter] = useState(0);
  const preference = useMotionPreference();

  const chapterAt = (t: number) => {
    let index = 0;
    copy.chapters.forEach((c, i) => {
      if (t >= c.at) index = i;
    });
    return index;
  };

  /**
   * Match cut into the reel: the poster's play button travels to where the
   * first frame's green dot sits, shrinks to its size and turns green in one
   * beat, while the name wipes out. Playback starts underneath at once; the
   * dot does not move during the first beat, so the hand-off is seamless.
   */
  const runIntro = () => {
    const frame = frameRef.current;
    const knob = knobRef.current;
    if (!frame || !knob || preference === "reduced") return;
    const f = frame.getBoundingClientRect();
    const k = knob.getBoundingClientRect();
    const scale = f.width / 1600;
    const dx = f.left + f.width * 0.5 - (k.left + k.width / 2);
    const dy = f.top + f.height * 0.4 - (k.top + k.height / 2);
    const size = (26 * scale) / k.width;
    setIntro(true);
    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    const travel = knob.animate(
      [
        { transform: "translate(0, 0) scale(1)", background: "var(--reel-fg)" },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${size})`,
          background: "var(--reel-e2)",
        },
      ],
      { duration: 500, easing: ease, fill: "forwards" },
    );
    knob.firstElementChild?.animate([{ scale: 1 }, { scale: 0 }], {
      duration: 160,
      fill: "forwards",
    });
    nameRef.current?.animate(
      [
        { clipPath: "inset(-20% 0 -20% 0)" },
        { clipPath: "inset(-20% 0 -20% 100%)" },
      ],
      {
        duration: 450,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
      },
    );
    void travel.finished.then(() => setIntro(false));
  };

  const play = () => {
    if (!controls.current) return;
    if (statusRef.current === "idle") runIntro();
    controls.current.play();
    setStatus("playing");
  };
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
    statusRef.current = status;
  });
  const pause = () => {
    controls.current?.pause();
    setStatus((s) => (s === "playing" ? "paused" : s));
  };

  // Load the stage once the reel is within a screen of the viewport;
  // autoplay while at least half of it is visible.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          loader.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    loader.observe(frame);
    const viewer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.intersectionRatio >= 0.5;
        const c = controls.current;
        if (!c) return;
        if (!inView.current && c.playing) {
          c.pause();
          setStatus("paused");
        }
      },
      { threshold: [0, 0.5] },
    );
    viewer.observe(frame);
    return () => {
      loader.disconnect();
      viewer.disconnect();
    };
  }, []);

  // Autoplay when it becomes visible and motion is allowed.
  useEffect(() => {
    if (!ready || preference === "reduced") return;
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const c = controls.current;
        if (!c || userPaused.current || c.playing) return;
        if (entry.intersectionRatio >= 0.5 && c.time < c.duration) {
          playRef.current();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [ready, preference]);

  const onFrame = (t: number) => {
    if (scrubRef.current) {
      scrubRef.current.value = String(t);
      scrubRef.current.style.setProperty("--p", `${(t / DURATION) * 100}%`);
    }
    if (timeRef.current) timeRef.current.textContent = timecode(t);
    if (playheadRef.current)
      playheadRef.current.style.left = `${(t / DURATION) * 100}%`;
    const index = chapterAt(t);
    setChapter((prev) => (prev === index ? prev : index));
  };

  const toggle = () => {
    if (status === "playing") {
      userPaused.current = true;
      pause();
    } else {
      userPaused.current = false;
      if (status === "ended") controls.current?.seek(0);
      play();
    }
  };

  const seek = (t: number) => {
    controls.current?.seek(t);
    // Scrubbing reveals the stage; it never starts playback on its own.
    setStatus((s) =>
      s === "idle" || (s === "ended" && t < DURATION) ? "paused" : s,
    );
  };

  const fullscreen = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    // iOS Safari cannot put an element in full screen, only a video:
    // there the exported film opens in the system player instead.
    if (!frame.requestFullscreen) {
      window.open(copy.video.src, "_blank", "noopener");
      return;
    }
    void frame
      .requestFullscreen()
      .then(() => {
        // Phones: turn to landscape where the browser allows it.
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        };
        return orientation.lock?.("landscape");
      })
      .catch(() => {});
  };

  const label =
    status === "playing"
      ? copy.pause
      : status === "ended"
        ? copy.replay
        : copy.play;

  return (
    <div>
      <div
        ref={frameRef}
        className="reel-frame relative aspect-video w-full overflow-hidden rounded-sm bg-[var(--reel-bg)] text-[var(--reel-fg)] select-none"
        onClick={() => ready && toggle()}
      >
        {near ? (
          <ReelStage
            copy={copy}
            onReady={(c) => {
              controls.current = c;
              setReady(true);
            }}
            onFrame={onFrame}
            onEnd={() => {
              // The last frame equals the first: keep looping while it is
              // watched, unless the visitor paused or turned motion off.
              const c = controls.current;
              if (
                c &&
                inView.current &&
                !userPaused.current &&
                preference !== "reduced"
              ) {
                c.seek(0);
                c.play();
              } else {
                setStatus("ended");
              }
            }}
          />
        ) : null}

        {/* Poster: shown until the stage is ready and whenever the reel has
            not started. It leaves through the match cut above, never a fade. */}
        <div
          ref={posterRef}
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--reel-bg)]",
            ready && status !== "idle" && !intro && "invisible",
            intro && "bg-transparent",
          )}
        >
          <p
            ref={nameRef}
            className="text-[clamp(2.5rem,9vw,7rem)] leading-none font-black font-expanded"
          >
            Amo Feng
          </p>
          <span
            ref={knobRef}
            className="flex size-16 items-center justify-center rounded-full bg-[var(--reel-fg)] text-[var(--reel-bg)] md:size-20"
          >
            <svg viewBox="0 0 24 24" className="ml-1 size-7" aria-hidden="true">
              <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          className="flex h-11 min-w-24 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            {status === "playing" ? (
              <path
                d="M6 4 H10 V20 H6 Z M14 4 H18 V20 H14 Z"
                fill="currentColor"
              />
            ) : (
              <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
            )}
          </svg>
          {label}
        </button>
        <input
          ref={scrubRef}
          type="range"
          min={0}
          max={DURATION}
          step={0.01}
          defaultValue={0}
          disabled={!ready}
          aria-label={copy.scrubber}
          onPointerDown={() => {
            if (status === "playing") pause();
          }}
          onInput={(e) => seek(Number(e.currentTarget.value))}
          className="reel-scrub min-w-0 flex-1"
        />
        <span className="w-24 shrink-0 text-right text-sm text-ink-soft tabular">
          <span ref={timeRef}>00:00</span> / 00:{DURATION}
        </span>
        <button
          type="button"
          onClick={fullscreen}
          disabled={!ready}
          aria-label={copy.fullscreen}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-control hover:border-ink disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 9 V4 H9 M15 4 H20 V9 M20 15 V20 H15 M9 20 H4 V15" />
          </svg>
        </button>
      </div>

      <nav aria-label={copy.chaptersLabel} className="mt-4">
        <ol className="flex flex-wrap gap-2">
          {copy.chapters.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={!ready}
                aria-current={
                  chapter === i && status !== "idle" ? "step" : undefined
                }
                onClick={() => {
                  seek(c.at + 0.01);
                  userPaused.current = false;
                  play();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-40",
                  chapter === i && status !== "idle"
                    ? "border-ink bg-ink text-paper"
                    : "border-control hover:border-ink",
                )}
              >
                <span className="tabular opacity-70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {c.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <MakingOf
        copy={copy}
        ready={ready}
        playheadRef={playheadRef}
        onSeek={(t) => {
          seek(t);
          userPaused.current = false;
          play();
        }}
      />
    </div>
  );
}
