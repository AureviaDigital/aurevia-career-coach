import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Tailor your resume to any job post in minutes.
        </h1>
        <p className="mb-8 text-xl text-slate-600 sm:text-2xl">
          Paste your resume and the job description. Get a cleaner, more
          relevant version instantly.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/app">
            <Button size="lg" className="text-lg">
              Get Started
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg">
              Learn More
            </Button>
          </Link>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-[1100px]">
            <Image
              src="/app-preview.png"
              alt="Aurevia Career Coach app preview"
              width={1100}
              height={700}
              className="w-full rounded-2xl shadow-2xl -rotate-2"
              priority
            />
          </div>
        </div>

        <div id="features" className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Precision Resume Tailoring
            </h3>
            <p className="text-slate-600">
              AI analyzes the job description and rewrites your resume to match
              what hiring managers are looking for.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Daily Free Usage
            </h3>
            <p className="text-slate-600">
              Get 3 resume optimizations and 3 refinements per day at no cost.
              No credit card required.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Pro Unlock
            </h3>
            <p className="text-slate-600">
              Unlimited optimizations, unlimited refinements, and DOCX export
              for a polished, ready-to-send resume.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          <div className="rounded-lg bg-white p-6 shadow-md text-left">
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Free</h3>
            <p className="text-3xl font-bold text-slate-900 mb-3">$0</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>3 optimizations / day</li>
              <li>3 refinements / day</li>
              <li>Copy-paste export</li>
            </ul>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md text-left border-2 border-slate-900">
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Pro</h3>
            <p className="text-3xl font-bold text-slate-900 mb-3">$9<span className="text-base font-normal text-slate-500">/mo</span></p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Unlimited optimizations</li>
              <li>Unlimited refinements</li>
              <li>DOCX export</li>
            </ul>
          </div>
        </div>

        <footer className="mt-20 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-slate-700">
            Privacy Policy
          </Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="hover:text-slate-700">
            Terms of Service
          </Link>
        </footer>
      </div>
    </div>
  );
}
