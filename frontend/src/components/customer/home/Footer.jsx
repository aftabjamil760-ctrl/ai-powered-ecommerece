import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaTiktok,
  FaPinterest,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";
import Logo from "./Logo";

const cols = [
  {
    title: "Shop",
    links: [
      { to: "/products/men", label: "Men" },
      { to: "/products/women", label: "Women" },
      { to: "/products/kids", label: "Kids" },
      { to: "/products/footwear", label: "Footwear" },
      { to: "/products/accessories", label: "Accessories" },
    ],
  },
  {
    title: "About",
    links: [
      { to: "/", label: "Our Story" },
      { to: "/", label: "Sustainability" },
      { to: "/", label: "Craftsmanship" },
      { to: "/", label: "Journal" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/orders", label: "Track Order" },
      { to: "/payments", label: "Payments" },
      { to: "/", label: "Shipping" },
      { to: "/", label: "Returns" },
    ],
  },
  {
    title: "Contact",
    links: [
      { to: "/", label: "hello@summernest.co" },
      { to: "/", label: "+1 (555) 088 2200" },
      { to: "/", label: "Lisbon · Bali · NYC" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="brightness-0 invert">
              <Logo />
            </div>
            <p className="mt-4 max-w-sm text-sm text-background/70">
              A modern summer wardrobe — carefully designed, ethically made, and built to travel with
              you from coast to coast.
            </p>
            <div className="mt-6 flex gap-2">
              {[FaInstagram, FaTiktok, FaPinterest, FaFacebookF, FaXTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-background/15 text-background/80 transition hover:bg-background hover:text-foreground"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-background/60">
                  {c.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {c.links.map((l, i) => (
                    <li key={i}>
                      <Link to={l.to} className="text-background/80 transition hover:text-background">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-background/10 pt-6 text-xs text-background/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SummerNest. All rights reserved.</p>
          <p>Crafted with warmth for endless summers.</p>
        </div>
      </div>
    </footer>
  );
}

