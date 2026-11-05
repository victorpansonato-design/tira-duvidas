import { useEffect, useRef, useState } from "react";
import { useMedia } from "./useReducedMotion";
export function StudyFilm({ disabled = false }: { disabled?: boolean }) {
  const desktop = useMedia("(min-width:1024px)");
  const reduced = useMedia("(prefers-reduced-motion:reduce)");
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData,
  );
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const eligible = desktop && !reduced && !disabled && !saveData && !failed;
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.defaultMuted = true;
    el.muted = true;
    const sync = () => {
      if (document.hidden) el.pause();
      else void el.play().catch(() => {});
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      el.pause();
    };
  }, [eligible]);
  if (!desktop) return null;
  return (
    <div className="td-film" aria-hidden="true">
      <img src="/assets/study-poster-4k.jpg" alt="" width="640" height="360" />
      {eligible ? (
        <video
          ref={video}
          src="/assets/study-loop-4k.mp4"
          poster="/assets/study-poster-4k.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
