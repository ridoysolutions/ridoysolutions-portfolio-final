"use client";

import Lenis from "lenis";
// @ts-ignore Lenis CSS is loaded by the bundler and has no TypeScript declaration.
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ScrollAnimation = () => {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
    });

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    let animationObserver: IntersectionObserver | undefined;

    const frame = requestAnimationFrame(() => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]"),
      );

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion || !("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
      } else if (elements.length) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer?.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px",
          },
        );

        elements.forEach((element) => observer?.observe(element));
      }

      // Keep the original animations intact, but stop painting animated elements
      // while they are well outside the viewport. They resume automatically when
      // they become visible again.
      const animatedElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".dashboard-shell, .about-photo-shell, .reviews-track, .hero-float-chip, .status-dot, .hero-trust-pulse, .trust-dot, .trust-ring",
        ),
      );

      if ("IntersectionObserver" in window && animatedElements.length) {
        animationObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const element = entry.target as HTMLElement;
              element.classList.toggle(
                "animation-offscreen-paused",
                !entry.isIntersecting,
              );
            });
          },
          { rootMargin: "120px 0px", threshold: 0 },
        );

        animatedElements.forEach((element) =>
          animationObserver?.observe(element),
        );
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      animationObserver?.disconnect();
    };
  }, [pathname]);

  return null;
};

export default ScrollAnimation;
