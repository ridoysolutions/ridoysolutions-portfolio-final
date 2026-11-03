"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { FaTimes, FaWhatsapp } from "react-icons/fa";

export default function WhatsAppChat({
  name,
  image,
  phone,
}: {
  name: string;
  image: string;
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  const number = phone.replace(/\D/g, "");

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[50] flex flex-col items-end gap-3 md:bottom-7 md:right-7">
      {/* Chat panel: শুধু open true হলে render হবে */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="whatsapp-chat-panel"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }
            }
            transition={{
              duration: reduceMotion ? 0.01 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-auto w-[min(360px,calc(100vw-32px))] origin-bottom-right overflow-hidden rounded-3xl border border-accent/30 bg-[#071426] text-white shadow-[0_20px_70px_rgba(0,0,0,.45)] motion-reduce:transition-none"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#071426] via-[#10284a] to-[#30205f] p-4 text-white">
              <Image
                src={image}
                alt={name}
                width={52}
                height={52}
                className="h-13 w-13 rounded-full border-2 border-white/50 object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="font-bold">{name}</p>
                <p className="text-xs text-slate-300">SEO Expert & Consultant</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close WhatsApp chat"
                className="pointer-events-auto rounded-full p-2 hover:bg-white/10"
              >
                <FaTimes />
              </button>
            </div>

            <div className="min-h-40 bg-gradient-to-b from-[#0b1b31] to-[#10172b] p-5">
              <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#17263b] p-4 text-white shadow-sm">
                <p className="text-xs font-bold">{name}</p>

                <p className="mt-2 leading-6">
                  Hi there! 👋
                  <br />
                  Contact {name} today. How can I help with your project?
                </p>

                <p className="mt-2 text-right text-[10px] text-slate-400">
                  {ready ? "Just now" : ""}
                </p>
              </div>
            </div>

            <div className="p-4">
              <button
                type="button"
                onClick={() => {
                  setReady(true);
                  window.open(
                    `https://wa.me/${number}?text=${encodeURIComponent(
                      `Hi ${name}, I'd like to discuss a project with you.`,
                    )}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-[#7b4dff] px-4 py-3 font-bold text-white transition hover:brightness-110"
              >
                <FaWhatsapp /> Click to start chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp button stays available while the panel is open or closed. */}
      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous);
          if (!open) setReady(false);
        }}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#7b4dff] text-3xl text-white shadow-lg transition duration-300 hover:scale-105 motion-reduce:transform-none"
      >
        <FaWhatsapp />

        {!open && (
          <span className="absolute right-0 top-0 h-4 w-4 rounded-full border-2 border-[#071426] bg-red-500" />
        )}
      </button>
    </div>
  );
}
