import Image from "next/image";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Logo + Description */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              {/* Light mode logo */}
              <Image
                src="/images/logo_light.png"
                alt="Ludeva Logo"
                width={140}
                height={40}
                className="block dark:hidden object-contain"
                priority
              />

              {/* Dark mode logo */}
              <Image
                src="/images/logo_dark.png"
                alt="Ludeva Logo"
                width={140}
                height={40}
                className="hidden dark:block object-contain"
                priority
              />
            </Link>

            <p className="text-muted-foreground text-sm">
              Accessible, Secure & Smart Investments in Kenya.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mmf" className="text-muted-foreground hover:text-primary">
                  Money Market Fund
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ludeva Public Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}