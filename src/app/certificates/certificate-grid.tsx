"use client";
import type { Certificate } from "@/constant/certificates";
import Image from "next/image";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
export default function CertificateGrid({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const [selected, setSelected] = useState<Certificate | null>(null);
  return (
    <>
      {certificates.length ? <div className="certificate-all-grid mt-12">
        {certificates.map((c) => (
          <button
            key={c.id}
            type="button"
            className="certificate-preview-card certificate-image-card text-left"
            onClick={() => setSelected(c)}
          >
            <div className="certificate-image-frame">
              <Image
                src={c.image || "/images/certificates/ads display.jpg"}
                alt={c.title}
                fill
                sizes="(max-width: 767px) 100vw, 360px"
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div> : <div className="mt-12 rounded-2xl border border-white/10 p-10 text-center"><h2 className="text-lg font-bold text-white">No certificates found</h2><p className="mt-2 text-sm text-slate-400">Published certificates will appear here when available.</p></div>}
      {selected && (
        <div
          className="certificate-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="certificate-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="certificate-lightbox-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <Image
              src={selected.image || "/images/certificates/ads display.jpg"}
              alt={selected.title}
              fill
              sizes="94vw"
              className="certificate-lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  );
}
