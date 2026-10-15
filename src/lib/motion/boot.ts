/**
 * Motion preference, stored as `data-motion` on <html>: "full" | "reduced".
 *
 * The system setting (prefers-reduced-motion, or Data Saver) is the default; a visitor can
 * override it either way with the toggle in the hero, and that choice is
 * remembered. CSS, Motion and the WebGL hero all read the same attribute,
 * so one switch controls everything.
 */
export type MotionPreference = "full" | "reduced";

export const MOTION_STORAGE_KEY = "amo:motion";

/** Runs before first paint (inline in <head>) so nothing animates by mistake. */
export const motionBootScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  MOTION_STORAGE_KEY,
)});var r=s==="full"||s==="reduced"?s:(matchMedia("(prefers-reduced-motion: reduce)").matches||(navigator.connection&&navigator.connection.saveData)?"reduced":"full");document.documentElement.dataset.motion=r}catch(e){document.documentElement.dataset.motion="full"}})()`;
