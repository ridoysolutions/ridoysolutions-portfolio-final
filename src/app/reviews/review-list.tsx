"use client";

import type { Review } from "@/constant/reviews";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { ReviewCard } from "../(root)/components/reviews/review-card";

const PAGE_SIZE = 9;

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(1);
  const reduceMotion = useReducedMotion();

  const pageCount = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);

  const visible = useMemo(
    () => reviews.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [reviews, current],
  );

  // Change page and scroll to the beginning of the reviews section
  const handlePageChange = (newPage: number) => {
    if (newPage === current) return;

    setPage(newPage);

    document.getElementById("reviews-list")?.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      block: "start",
    });
    // Update the page and trigger the review card animations
    setPage(newPage);
  };

  return (
    <>
      <div
        id="reviews-list"
        className="mt-12 scroll-mt-24 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="contents"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            {visible.map((review, index) => (
              <motion.div
                key={review.id || `${review.name}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.35,
                        delay: index * 0.055,
                        ease: "easeOut",
                      }
                }
              >
                <ReviewCard review={review} staticCard />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pageCount > 1 && (
        <nav
          aria-label="Review pagination"
          className="mt-9 flex w-full flex-nowrap items-center justify-center gap-1 overflow-x-auto"
        >
          <button
            aria-label="Previous page"
            className="outline-button !h-7 !min-h-0 !shrink-0 !px-2 !py-1 !text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => handlePageChange(Math.max(1, current - 1))}
            disabled={current === 1}
          >
            Prev
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              aria-current={current === number ? "page" : undefined}
              aria-label={`Page ${number}`}
              className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border px-1 text-xs transition ${
                current === number
                  ? "border-accent bg-accent/15 text-white"
                  : "border-white/10 text-slate-400 hover:border-accent/50 hover:text-white"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            aria-label="Next page"
            className="outline-button !h-7 !min-h-0 !shrink-0 !px-2 !py-1 !text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => handlePageChange(Math.min(pageCount, current + 1))}
            disabled={current === pageCount}
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}
