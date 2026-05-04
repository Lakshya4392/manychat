import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-24 border-t border-ink-black/5 bg-canvas relative z-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer w-max">
              <div className="w-8 h-8 bg-ink-black rounded-[8px] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-medium tracking-tighter text-ink-black">Dia.</span>
            </Link>
            <p className="mt-6 text-slate max-w-sm font-regular leading-relaxed text-[15px]">
              Stop losing leads in your DMs. Deploy intelligent AI personas to monetize your audience on autopilot.
            </p>
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-ink-black mb-6">Product</h3>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-[14px] text-slate hover:text-ink-black transition-colors">Features</Link></li>
              <li><Link href="#flows" className="text-[14px] text-slate hover:text-ink-black transition-colors">Workflows</Link></li>
              <li><Link href="#pricing" className="text-[14px] text-slate hover:text-ink-black transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-ink-black mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[14px] text-slate hover:text-ink-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-[14px] text-slate hover:text-ink-black transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-24 border-t border-ink-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate text-[13px]">
            &copy; {new Date().getFullYear()} Dia. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <span className="text-[13px] text-slate hover:text-ink-black transition-colors cursor-pointer">Twitter</span>
            <span className="text-[13px] text-slate hover:text-ink-black transition-colors cursor-pointer">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
