"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfDocument({ title, url }: { title: string; url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFailed(false);
    setNumPages(0);
    setPageNumber(1);
    setScale(1);
  }, [url]);

  if (failed) {
    return (
      <div className="paper-reader-message" role="alert">
        <p>This paper could not be displayed here.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="secondary-button">
          Open PDF in a new tab
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="paper-reader-controls" aria-label="PDF controls">
        <div className="paper-reader-control-group">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {pageNumber} of {numPages || "…"}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.min(numPages, page + 1))}
            disabled={!numPages || pageNumber >= numPages}
          >
            Next
          </button>
        </div>
        <span className="paper-reader-control-divider" aria-hidden="true" />
        <div className="paper-reader-control-group">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setScale((value) => Math.max(0.75, value - 0.25))}
            disabled={scale <= 0.75}
          >
            −
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setScale((value) => Math.min(1.5, value + 0.25))}
            disabled={scale >= 1.5}
          >
            +
          </button>
        </div>
      </div>

      <div ref={containerRef} className="paper-reader-document">
        <Document
          file={url}
          loading={<p className="paper-reader-message">Loading {title}…</p>}
          onLoadSuccess={({ numPages: loadedPages }) => {
            setFailed(false);
            setNumPages(loadedPages);
            setPageNumber((page) => Math.min(page, loadedPages));
          }}
          onLoadError={() => setFailed(true)}
          onSourceError={() => setFailed(true)}
        >
          {containerWidth > 0 ? (
            <Page
              pageNumber={pageNumber}
              width={Math.max(240, containerWidth - 32)}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          ) : null}
        </Document>
      </div>
    </>
  );
}
