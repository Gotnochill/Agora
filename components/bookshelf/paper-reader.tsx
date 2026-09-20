"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const PdfDocument = dynamic(() => import("./pdf-document"), {
  ssr: false,
  loading: () => <p className="paper-reader-message">Loading reader…</p>,
});

export default function PaperReader({ title, url }: { title: string; url: string }) {
  const readerRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreenState = () =>
      setIsFullscreen(document.fullscreenElement === readerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await readerRef.current?.requestFullscreen();
    }
  };

  return (
    <section ref={readerRef} className="paper-reader" aria-labelledby="paper-reader-heading">
      <div className="paper-reader-heading">
        <div>
          <p className="section-label">Research paper</p>
          <h2 id="paper-reader-heading">Read online</h2>
        </div>
        <div className="paper-reader-heading-actions">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-link">
            Open original
          </a>
          <button
            type="button"
            className="secondary-button"
            aria-pressed={isFullscreen}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>
      <PdfDocument title={title} url={url} />
    </section>
  );
}
