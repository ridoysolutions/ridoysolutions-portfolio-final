function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />
  );
}

export default function BlogDetailLoading() {
  return (
    <main className="min-h-screen bg-[#020711] px-1 pb-20 pt-28 text-white md:pt-32">
      <div className="wrapper">
        {/* Back link skeleton */}
        <SkeletonBlock className="h-4 w-28" />

        {/* Blog title and cover image */}
        <header className="mt-5 grid items-center gap-7 lg:grid-cols-[1.35fr_.9fr]">
          <div className="space-y-5">
            <SkeletonBlock className="h-3 w-56 max-w-full" />
            <SkeletonBlock className="h-10 w-full max-w-xl" />
            <SkeletonBlock className="h-8 w-4/5 max-w-lg" />

            {/* Author and date */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-3 w-44 max-w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-32" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
            </div>
          </div>

          <SkeletonBlock className="h-52 w-full rounded-xl sm:h-64 lg:h-[280px]" />
        </header>

        {/* Article and sidebar */}
        <div className="mt-10 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_268px]">
          <article className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#061224]/60 p-4 sm:p-7 md:p-8">
            {/* Excerpt */}
            <SkeletonBlock className="h-20 w-full rounded-xl" />

            {/* Article paragraphs */}
            <div className="space-y-3 pt-2">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
            </div>

            <div className="space-y-3 pt-4">
              <SkeletonBlock className="h-6 w-3/4" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-10/12" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>

            <div className="space-y-3 pt-4">
              <SkeletonBlock className="h-6 w-1/2" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-full" />
            </div>

            {/* Contact CTA*/}
            <SkeletonBlock className="mt-8 h-44 w-full rounded-2xl" />
          </article>

          {/* Sidebar skeleton */}
          <aside className="hidden space-y-4 lg:block">
            <SkeletonBlock className="h-56 w-full rounded-xl" />
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#061224]/60 p-5">
              <SkeletonBlock className="mx-auto h-20 w-20 rounded-full" />
              <SkeletonBlock className="mx-auto h-5 w-32" />
              <SkeletonBlock className="mx-auto h-4 w-40 max-w-full" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
