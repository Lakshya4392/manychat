import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold font-heading tracking-tighter text-white">
              MANY<span className="text-primary">CHAT</span>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-xs">
              The ultimate starting point for your next great idea. Built with speed and elegance in mind.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} ManyChat. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <span className="text-muted-foreground hover:text-white transition-colors cursor-pointer">Twitter</span>
            <span className="text-muted-foreground hover:text-white transition-colors cursor-pointer">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
