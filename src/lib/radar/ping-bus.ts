/**
 * A tiny bridge so UI outside the hero (the motion switch) can send a ping
 * into the radar field. If the renderer is not up yet (switching motion on
 * rebuilds it), the ping waits and is delivered once it is.
 */
type Ping = { clientX: number; clientY: number };
type Listener = (ping: Ping) => void;

let listener: Listener | null = null;
let pending: Ping | null = null;

export function requestPing(clientX: number, clientY: number): void {
  const ping = { clientX, clientY };
  if (listener) listener(ping);
  else pending = ping;
}

/** The renderer side: receives pings, including one that was waiting. */
export function onPing(fn: Listener): () => void {
  listener = fn;
  if (pending) {
    const p = pending;
    pending = null;
    fn(p);
  }
  return () => {
    if (listener === fn) listener = null;
  };
}
