import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">NBC</span>
              </div>
              <span className="font-bold text-xl text-white">NextBoomCity</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted partner for real estate investments across India's emerging cities.
              Discover opportunities in Faridabad, Dholera, Vrindavan, and more.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Properties</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties/residential" className="text-gray-400 hover:text-white transition-colors">
                  Residential
                </Link>
              </li>
              <li>
                <Link href="/properties/commercial" className="text-gray-400 hover:text-white transition-colors">
                  Commercial
                </Link>
              </li>
              <li>
                <Link href="/properties/plots" className="text-gray-400 hover:text-white transition-colors">
                  Plots & Land
                </Link>
              </li>
              <li>
                <Link href="/properties/religious" className="text-gray-400 hover:text-white transition-colors">
                  Religious Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Locations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/locations/faridabad" className="text-gray-400 hover:text-white transition-colors">
                  Faridabad
                </Link>
              </li>
              <li>
                <Link href="/locations/ncr" className="text-gray-400 hover:text-white transition-colors">
                  NCR
                </Link>
              </li>
              <li>
                <Link href="/locations/dholera" className="text-gray-400 hover:text-white transition-colors">
                  Dholera
                </Link>
              </li>
              <li>
                <Link href="/locations/vrindavan" className="text-gray-400 hover:text-white transition-colors">
                  Vrindavan
                </Link>
              </li>
              <li>
                <Link href="/locations/ayodhya" className="text-gray-400 hover:text-white transition-colors">
                  Ayodhya
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-gray-400 hover:text-white transition-colors">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link href="/maps" className="text-gray-400 hover:text-white transition-colors">
                  Maps & Analytics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 NextBoomCity. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors text-sm">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}