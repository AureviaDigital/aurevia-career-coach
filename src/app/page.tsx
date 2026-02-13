import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Aurevia Career Coach
        </h1>
        <p className="mb-8 text-xl text-slate-600 sm:text-2xl">
          Your AI-powered career development companion. Get personalized
          guidance, resume optimization, and interview preparation.
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

        <div id="features" className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Career Guidance
            </h3>
            <p className="text-slate-600">
              Get personalized career advice tailored to your goals and
              experience.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Resume Optimization
            </h3>
            <p className="text-slate-600">
              Improve your resume with AI-powered suggestions and best
              practices.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Interview Prep
            </h3>
            <p className="text-slate-600">
              Practice with common interview questions and get instant feedback.
            </p>
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
