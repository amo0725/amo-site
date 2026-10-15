"use client";

import { useSyncExternalStore } from "react";
import { InlineScript } from "./inline-script";

interface LocalClockProps {
  /** Unique DOM id, needed by the pre-paint script. */
  id: string;
  timeZone: string;
  className?: string;
}

const PLACEHOLDER = "--:--";

function formatter(timeZone: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(timer);
}

/** Live wall-clock time in a fixed time zone, with no flash on first paint. */
export function LocalClock({ id, timeZone, className }: LocalClockProps) {
  const time = useSyncExternalStore(
    subscribe,
    () => formatter(timeZone).format(Date.now()),
    () => PLACEHOLDER,
  );

  const prePaint = `(function(){var e=document.getElementById(${JSON.stringify(id)});if(e)e.textContent=new Intl.DateTimeFormat("zh-TW",{timeZone:${JSON.stringify(timeZone)},hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(Date.now())})()`;

  return (
    <>
      <time id={id} className={className} suppressHydrationWarning>
        {time}
      </time>
      <InlineScript html={prePaint} />
    </>
  );
}
