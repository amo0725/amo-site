import type Lenis from "lenis";

/**
 * The page's Lenis instance, when smooth scrolling is on (mouse and
 * trackpad, motion allowed). Code that moves the page programmatically
 * goes through it, so Lenis's cached scroll position and limits stay in
 * step with the jump.
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;
