import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-10 pb-8 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Domestic Holidays</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/destination/india/himachal-tour-packages" className="hover:text-amber-400 transition-colors">Himachal Tour Packages</Link></li>
              <li><Link href="/destination/india/kashmir-tour-packages" className="hover:text-amber-400 transition-colors">Kashmir Holiday Packages</Link></li>
              <li><Link href="/destination/india/kerala-tour-packages" className="hover:text-amber-400 transition-colors">Kerala Backwaters Tours</Link></li>
              <li><Link href="/destination/india/rajasthan-tour-packages" className="hover:text-amber-400 transition-colors">Rajasthan Forts &amp; Palaces</Link></li>
              <li><Link href="/destination/india/goa-tour-packages" className="hover:text-amber-400 transition-colors">Goa Beach Packages</Link></li>
              <li><Link href="/destination/india/andaman-tour-packages" className="hover:text-amber-400 transition-colors">Andaman Islands Scuba</Link></li>
              <li><Link href="/destination/india/ladakh-tour-packages" className="hover:text-amber-400 transition-colors">Ladakh &amp; Spiti Roadtrips</Link></li>
              <li><Link href="/destination/india/uttarakhand-tour-packages" className="hover:text-amber-400 transition-colors">Uttarakhand Spiritual Circuits</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">International Tours</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/destination/dubai-tour-packages" className="hover:text-amber-400 transition-colors">Dubai Tour Packages</Link></li>
              <li><Link href="/destination/bali-tour-packages" className="hover:text-amber-400 transition-colors">Bali Honeymoon Packages</Link></li>
              <li><Link href="/destination/thailand-tour-packages" className="hover:text-amber-400 transition-colors">Thailand Beach Holidays</Link></li>
              <li><Link href="/destination/vietnam-tour-packages" className="hover:text-amber-400 transition-colors">Vietnam &amp; Ha Long Bay</Link></li>
              <li><Link href="/destination/singapore-tour-packages" className="hover:text-amber-400 transition-colors">Singapore &amp; Sentosa</Link></li>
              <li><Link href="/destination/maldives-tour-packages" className="hover:text-amber-400 transition-colors">Maldives Overwater Villas</Link></li>
              <li><Link href="/destination/europe-tour-packages" className="hover:text-amber-400 transition-colors">Europe Grand Tours</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Holiday Themes</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/packages?theme=HONEYMOON" className="hover:text-amber-400 transition-colors">Honeymoon Specials</Link></li>
              <li><Link href="/packages?theme=FAMILY" className="hover:text-amber-400 transition-colors">Family Vacation Circuits</Link></li>
              <li><Link href="/packages?theme=ADVENTURE" className="hover:text-amber-400 transition-colors">Adventure &amp; Trekking</Link></li>
              <li><Link href="/packages?theme=SPIRITUAL" className="hover:text-amber-400 transition-colors">Spiritual &amp; Pilgrimage</Link></li>
              <li><Link href="/packages?theme=LUXURY" className="hover:text-amber-400 transition-colors">Luxury Heritage Stays</Link></li>
              <li><Link href="/customize?duration=SHORT" className="hover:text-amber-400 transition-colors">Weekend Roadtrips</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company &amp; Legal</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Be My Traveller</Link></li>
              <li><Link href="/admin/login" className="hover:text-amber-400 transition-colors">Admin Portal Login</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Careers &amp; Partners</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation &amp; Refund Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Secure Booking</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              256-Bit SSL Encrypted checkout. Authorized payments through Razorpay, UPI, Visa, Mastercard, and Net Banking.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-slate-300 font-bold text-[10px]">
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">VISA</span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Mastercard</span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">UPI</span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Net Banking</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              B
            </span>
            <span>© {new Date().getFullYear()} Be My Traveller India Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ for Global Explorers · Technology Partner RRDS</span>
            <span className="text-amber-400 font-semibold">v1.0.0 Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
