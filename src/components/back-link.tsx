"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  fallbackHref: string;
  children: ReactNode;
  className?: string;
};

export default function BackLink({
  fallbackHref,
  children,
  className = "",
}: Props) {
  const router = useRouter();

  const goBack = () => {
    // Explicit section return targets are used when a user entered a full-page
    // view from a homepage section. Detail pages without this parameter keep
    // normal browser history, so case-study details return to the listing.
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("returnTo");
    if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
      router.push(returnTo);
      return;
    }
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button type="button" onClick={goBack} className={className}>
      {children}
    </button>
  );
}
