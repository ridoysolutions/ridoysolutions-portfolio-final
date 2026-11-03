import { AdminProfile } from "@/lib/admin/types";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

// Keep footer navigation aligned with the primary site navigation.
const footerLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Certificates", href: "/#certificates" },
  { label: "Case Studies", href: "/#case-studies" },
  { label: "Blog", href: "/blog" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

const Footer = ({
  profile,
  settings,
}: {
  profile: AdminProfile;
  settings?: any;
}) => (
  <footer className="border-t border-white/10 py-8">
    <div className="flex flex-col gap-5 md:flex-row items-center md:justify-between">
      <Link
        href="/#home"
        className="flex items-center gap-2 text-sm font-bold text-white"
      >
        <span className="brand-mark">↗</span>{profile.name}
      </Link>
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap justify-center gap-4 lg:text-[12px] text-[10px] text-slate-400"
      >
        {footerLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="transition-colors duration-200 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Social profile links are managed from the admin profile settings. */}
      <div className="flex gap-2">
        {[
          { label: "LinkedIn", href: profile.linkedin, icon: <FaLinkedinIn /> },
          { label: "Instagram", href: profile.instagram, icon: <FaInstagram /> },
          { label: "Facebook", href: profile.facebook, icon: <FaFacebookF /> },
          { label: "Twitter / X", href: profile.twitter, icon: <FaTwitter /> },
        ].map((social) => (
          <a
            key={social.label}
            href={social.href || "#"}
            target={social.href ? "_blank" : undefined}
            rel={social.href ? "noreferrer" : undefined}
            aria-label={social.label}
            title={social.href ? social.label : `Add your ${social.label} URL in admin profile settings`}
            className="social-icon"
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
    <div className="mt-6 flex flex-col justify-between items-center gap-2 border-t border-white/5 pt-5 text-[10px] text-slate-500 sm:flex-row">
      <span>{settings?.footer_tagline || "More Traffic • More Leads • More Sales"}</span>
      <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
