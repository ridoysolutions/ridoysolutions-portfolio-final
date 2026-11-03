"use client";
import { useFormStatus } from "react-dom";
import { useDirtyForm } from "./dirty-form";

export default function BlogSubmitButton({
  label,
  pendingLabel = "Saving changes…",
  disabled = false,
}: {
  label: string;
  pendingLabel?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const dirty = useDirtyForm();
  return (
    <button
      type="submit"
      disabled={pending || disabled || dirty === false}
      aria-live="polite"
      className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl gradient-button px-5 py-3 text-sm font-extrabold text-[#102b43] shadow-sm transition hover:bg-[#a3df12] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#102b43]/30 border-t-[#102b43]" />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}
