/**
 * Runs `task` once the main thread is idle (or after `timeout` ms at the latest).
 * Returns a cancel function.
 */
export function onIdle(task: () => void, timeout = 1200): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(task, 200);
  return () => clearTimeout(id);
}
