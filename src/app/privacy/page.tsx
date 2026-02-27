import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-slate-900">
          Privacy Policy
        </h1>

        <p className="mb-8 text-slate-600">
          Aurevia Career Coach provides resume tailoring tools.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-slate-900">
          Information You Provide
        </h2>
        <p className="mb-2 text-slate-600">
          When you use the app, you may provide:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-1 text-slate-600">
          <li>Resume content</li>
          <li>Job descriptions</li>
        </ul>
        <p className="mb-8 text-slate-600">
          This content may be stored to provide history functionality and Pro
          features.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-slate-900">
          Payments
        </h2>
        <p className="mb-8 text-slate-600">
          Payments are processed securely by Stripe. We do not store your credit
          card information.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-slate-900">
          Data Usage
        </h2>
        <p className="mb-8 text-slate-600">
          Content you provide is used solely to generate resume outputs and
          operate the application.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-slate-900">
          No Account Required
        </h2>
        <p className="mb-8 text-slate-600">
          The app does not require user accounts. Access and Pro status are
          associated with your device.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-slate-900">Contact</h2>
        <p className="mb-12 text-slate-600">
          For questions about this policy, contact:{" "}
          <a
            href="mailto:hello@aureviadigital.com"
            className="text-slate-900 underline hover:text-slate-700"
          >
            hello@aureviadigital.com
          </a>
        </p>

        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
