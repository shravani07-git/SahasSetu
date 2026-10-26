"use client";

import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  platform: [
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  resources: [
    { name: "PoSH Act Overview", href: "/resources/posh-act" },
    { name: "Know Your Rights", href: "/resources/rights" },
    { name: "FAQs", href: "/resources/faqs" },
    { name: "Workshops", href: "/resources/workshops" },
  ],
  support: [
    { name: "Report an Incident", href: "/dashboard/report" },
    { name: "Find NGOs", href: "/dashboard/ngos" },
    { name: "Counseling Services", href: "/dashboard/counseling" },
    { name: "Emergency Help", href: "/support/emergency" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

const helplines = [
  { name: "Women Helpline", number: "181" },
  { name: "National Commission", number: "7827-170-170" },
  { name: "Police Emergency", number: "100" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Emergency Banner */}
      <div className="bg-primary-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
            <span className="font-medium">24/7 Emergency Helplines:</span>
            {helplines.map((helpline, index) => (
              <a
                key={index}
                href={`tel:${helpline.number.replace(/-/g, "")}`}
                className="flex items-center gap-2 hover:text-primary-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>
                  {helpline.name}: <strong>{helpline.number}</strong>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">SafeHer</span>
                <span className="text-xs block text-gray-400">
                  Secure Workplace
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              A secure, privacy-first platform for reporting workplace
              harassment. We stand with you, protecting your identity and
              rights every step of the way.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <a
                href="mailto:support@safeher.in"
                className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@safeher.in
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  Pan-India Coverage
                  <br />
                  Registered under PoSH Act 2013
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Get Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} SafeHer. All rights reserved. |
              Compliant with PoSH Act 2013
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-primary-500" /> for a
              safer workplace
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
