"use client";
import { createContext, useContext, useState } from "react";
export const DirtyFormContext = createContext<boolean | null>(null);
export function useDirtyForm() { return useContext(DirtyFormContext); }
export default function DirtyForm({ action, children, className }: { action: (formData: FormData) => void | Promise<void>; children: React.ReactNode; className?: string }) {
  const [dirty, setDirty] = useState(false);
  return <DirtyFormContext.Provider value={dirty}>
    <form action={action} className={className} onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
      {children}
    </form>
  </DirtyFormContext.Provider>;
}
