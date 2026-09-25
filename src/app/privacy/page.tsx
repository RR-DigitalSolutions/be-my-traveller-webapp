import type { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Be My Traveller",
  description: "How Be My Traveller collects, uses, and protects your personal data.",
  robots: "noindex",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <BmtNavMenu variant="solid" />

      <div className="bg-slate-900 px-4 py-14 text-center text-white">
        <h1 className="text-3xl font-black">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-16 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">1. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide when submitting enquiry forms, including: full name, phone number, email address, travel preferences, and special requirements. We may also collect usage data (IP addresses, browser type, pages visited) through analytics tools.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To respond to your travel enquiries and provide quotations</li>
            <li>To plan and manage your booked holiday packages</li>
            <li>To send relevant travel offers and itinerary suggestions (with your consent)</li>
            <li>To improve our website and services through anonymized analytics</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">3. Data Sharing</h2>
          <p>We do not sell or rent your personal data. We may share necessary booking information with hotels, transportation providers, and activity operators solely for the purpose of fulfilling your holiday arrangements. All third parties are bound by confidentiality obligations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">4. Data Security</h2>
          <p>Your data is stored in encrypted, password-protected databases hosted on secure cloud infrastructure. We implement industry-standard security measures including SSL/TLS encryption, bcrypt password hashing, and role-based access controls.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:privacy@bemytraveller.com" className="text-amber-600 hover:underline">privacy@bemytraveller.com</a>. We will respond within 7 business days.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">6. Cookies</h2>
          <p>We use essential cookies for session management and optional analytics cookies (Google Analytics) to understand how visitors use our website. You can opt out of analytics tracking via your browser settings.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">7. Contact</h2>
          <p>For privacy-related queries, contact: <a href="mailto:privacy@bemytraveller.com" className="text-amber-600 hover:underline">privacy@bemytraveller.com</a></p>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
