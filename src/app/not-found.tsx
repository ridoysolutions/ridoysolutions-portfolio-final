import Link from "next/link";
import { FaArrowLeft, FaSearch } from "react-icons/fa";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#061224]/70 p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-2xl text-accent"><FaSearch /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-accent">404 • Page Not Found</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">This page could not be found.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">The page or item you are looking for may have been removed, moved, or is no longer available.</p>
        <Link href="/" className="gradient-button mt-7 inline-flex"><FaArrowLeft className="mr-2" /> Back to Homepage</Link>
      </div>
    </main>
  );
}
