import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold font-heading tracking-tighter text-white">
              INBOX<span className="text-primary">LY</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors px-3 py-2 text-sm font-medium">Features</Link>
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors px-3 py-2 text-sm font-medium">Pricing</Link>
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors px-3 py-2 text-sm font-medium">About</Link>
              <Link href="#" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
