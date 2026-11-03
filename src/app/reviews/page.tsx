import BackLink from "@/components/back-link";
import { getProfile, getReviews } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Footer from "../(root)/components/footer";
import Navbar from "../(root)/components/layout/navbar/navbar";
import ReviewList from "./review-list";
import ReviewSubmissionForm from "./review-submission-form";

export const metadata: Metadata = {
  title: "Client Reviews",
  description:
    "Read client feedback and experiences from digital marketing projects and growth campaigns.",
  alternates: process.env.NEXT_PUBLIC_SITE_URL
    ? { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/reviews` }
    : undefined,
};

export default async function ReviewsPage() {
  const [reviews, profile] = await Promise.all([getReviews(), getProfile()]);
  return (
    <main className="page-enter">
      <Navbar profile={profile} />
      <div className="wrapper pt-32 pb-20">
        <BackLink
          fallbackHref="/#reviews"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <FaArrowLeft className="text-[10px]" /> Back to Home
        </BackLink>
        <div className="max-w-3xl">
          <span className="eyebrow">Client Reviews</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-.04em] text-white sm:text-5xl md:text-6xl">
            What My Clients <span className="gradient-text">Say</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            A complete collection of client feedback and experiences from
            projects, campaigns, and growth work.
          </p>
        </div>

        {reviews.length ? (
          <ReviewList reviews={reviews} />
        ) : (
          <div className="mt-12 rounded-2xl border border-white/10 p-10 text-center">
            <h2 className="text-lg font-bold text-white">No reviews found</h2>
            <p className="mt-2 text-sm text-slate-400">
              Client reviews will appear here when they are available.
            </p>
          </div>
        )}

        {/* <ReviewSubmissionForm /> */}

        <div className="reviews-page-actions mt-10 flex flex-nowrap gap-3">
          <Link
            href="/reviews/videos"
            className="gradient-button whitespace-nowrap"
          >
            Client Video Reviews <FaArrowRight className="text-[10px]" />
          </Link>
          <Link href="/#contact" className="outline-button whitespace-nowrap">
            Work With Me
          </Link>
        </div>
        <ReviewSubmissionForm />
      </div>
      <div className="wrapper">
        <Footer profile={profile} />
      </div>
    </main>
  );
}
