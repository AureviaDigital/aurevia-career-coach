import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-slate-900">
          Terms of Service
        </h1>

        <div className="space-y-6 rounded-lg bg-white p-8 shadow-md">
          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600">
              By accessing and using Aurevia Career Coach, you accept and agree
              to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              2. Use License
            </h2>
            <p className="text-slate-600">
              Permission is granted to temporarily use Aurevia Career Coach for
              personal, non-commercial purposes. This is the grant of a license,
              not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              3. User Account
            </h2>
            <p className="text-slate-600">
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              4. Disclaimer
            </h2>
            <p className="text-slate-600">
              The materials on Aurevia Career Coach are provided on an 'as is'
              basis. Aurevia makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              5. Limitations
            </h2>
            <p className="text-slate-600">
              In no event shall Aurevia or its suppliers be liable for any
              damages arising out of the use or inability to use the materials
              on Aurevia Career Coach.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              6. Modifications
            </h2>
            <p className="text-slate-600">
              Aurevia may revise these terms of service at any time without
              notice. By using this service you are agreeing to be bound by the
              then current version of these terms.
            </p>
          </section>

          <p className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
