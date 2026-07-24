import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import Logo from "./Logo";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/orders", label: "Orders" },
  { to: "/payments", label: "Payments" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    try {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // keep user state in sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'user') setUser(JSON.parse(e.newValue || 'null'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-white/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-foreground/5 text-foreground' : 'text-foreground/80 hover:text-foreground'}`}
                >
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <IconBtn onClick={() => setSearch((s) => !s)} label="Search">
              <FiSearch size={18} />
            </IconBtn>
            <IconBtn as={Link} to="/wishlist" label="Wishlist">
              <FiHeart size={18} />
            </IconBtn>
            <IconBtn as={Link} to="/cart" label="Cart" badge="2">
              <FiShoppingBag size={18} />
            </IconBtn>
            <IconBtn onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} label="Toggle theme">
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </IconBtn>

            {user ? (
              <>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      if (token) {
                        await fetch('/api/auth/delete', {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                        });
                      }
                    } catch (err) {
                      console.error('Failed to delete user account during logout:', err);
                    } finally {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setUser(null);
                      navigate('/');
                    }
                  }}
                  className="hidden rounded-full border border-foreground/10 px-4 py-2 text-sm font-medium transition hover:bg-foreground/5 md:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full border border-foreground/10 px-4 py-2 text-sm font-medium transition hover:bg-foreground/5 md:inline-flex"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 md:inline-flex"
                >
                  Register
                </Link>
              </>
            )}
            <button
              className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-foreground/5 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {search && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/40"
            >
              <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:px-8">
                <FiSearch className="text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Search linen shirts, sandals, beach bags..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/40 lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 md:px-8">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-2 flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 rounded-full border border-foreground/10 px-4 py-2 text-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 rounded-full bg-foreground px-4 py-2 text-center text-sm text-background"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function IconBtn({ children, label, as: Component = "button", badge, className = "", ...rest }) {
  return (
    <Component
      aria-label={label}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground ${className}`}
      {...rest}
    >
      {children}
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
    </Component>
  );
}

