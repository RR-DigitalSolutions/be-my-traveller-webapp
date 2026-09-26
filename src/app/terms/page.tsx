import type { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions | Be My Traveller",
  description: "Read the Terms & Conditions for using Be My Traveller's travel booking platform and services.",
  robots: "noindex",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <BmtNavMenu variant="solid" />

      <div className="bg-slate-900 px-4 py-14 text-center text-white">
        <h1 className="text-3xl font-black">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-16">
        <Section title="1. Acceptance of Terms">
          <p>By accessing and using the Be My Traveller website (bemytraveller.com) and its services, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.</p>
        </Section>

        <Section title="2. Services">
          <p>Be My Traveller provides travel planning, holiday package customization, hotel booking assistance, and travel enquiry management services. All prices displayed are indicative and subject to final confirmation by our pricing engine.</p>
        </Section>

        <Section title="3. Bookings & Payments">
          <p>All bookings are confirmed only upon receipt of the deposit amount as specified in your quotation. Prices are subject to availability and seasonal variation. The final price is confirmed at the time of booking and is server-validated to ensure accuracy.</p>
        </Section>

        <Section title="4. Cancellation Policy">
          <p>Cancellations must be made in writing via email or WhatsApp. Cancellation charges apply as per our Cancellation & Refund Policy. Please refer to <a href="/cancellation-policy" className="text-amber-600 hover:underline">our cancellation page</a> for full details.</p>
        </Section>

        <Section title="5. Limitation of Liability">
          <p>Be My Traveller acts as an intermediary between travellers and service providers (hotels, transport, activities). We are not liable for acts of nature, political events, supplier failures, or circumstances beyond our reasonable control.</p>
        </Section>

        <Section title="6. Privacy">
          <p>We collect and process personal data in accordance with our <a href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</a>. By using our services, you consent to such processing.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>All content on this website including text, images, itineraries, and design elements are the intellectual property of Be My Traveller / RR Digital Solutions. Reproduction without written permission is prohibited.</p>
        </Section>

        <Section title="8. Governing Law">
          <p>These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in India.</p>
        </Section>

        <Section title="9. Contact">
          <p>For any queries regarding these terms, contact us at <a href="mailto:legal@bemytraveller.com" className="text-amber-600 hover:underline">legal@bemytraveller.com</a> or call <a href="tel:918091638090" className="text-amber-600 hover:underline">+91 8091638090</a>.</p>
        </Section>
      </div>

      <SiteFooter />
    </div>
  );
}
