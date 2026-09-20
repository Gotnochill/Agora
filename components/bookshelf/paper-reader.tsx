"use client";

import dynamic from "next/dynamic";

const PdfDocument = dynamic(() => import("./pdf-document"), {
  ssr: false,
  loading: () => <p className="paper-reader-message">Loading reader…</p>,
});

export default function PaperReader({ title, url }: { title: string; url: string }) {
  return (
    <section className="paper-reader" aria-labelledby="paper-reader-heading">
      <div className="paper-reader-heading">
        <div>
          <p className="section-label">Research paper</p>
          <h2 id="paper-reader-heading">Read online</h2>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-link">
          Open original
        </a>
      </div>
      <PdfDocument title={title} url={url} />
    </section>
  );
}
