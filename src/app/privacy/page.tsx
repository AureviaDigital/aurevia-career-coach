import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="space-y-6 rounded-lg bg-white p-8 shadow-md">
          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              1. Information We Collect
            </h2>
            <p className="text-slate-600">
              We collect information you provide directly to us, including when
              you create an account, use our career coaching services, or
              communicate with us.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600">
              We use the information we collect to provide, maintain, and
              improve our services, to develop new features, and to protect
              Aurevia and our users.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              3. Information Sharing
            </h2>
            <p className="text-slate-600">
              We do not share your personal information with third parties
              except as described in this policy or with your consent.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              4. Data Security
            </h2>
            <p className="text-slate-600">
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, unauthorized access, and
              disclosure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              5. Contact Us
            </h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@aurevia.com
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
