import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Menu,
  X,
  Shield,
  ExternalLink,
  Home,
  Megaphone,
  Info,
  Users,
  Banknote,
  Download,
  Phone,
  HelpCircle,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Toaster } from "@/components/ui/toaster";

// Primary nav â€” always visible in the desktop bar
const primaryNavLinks = [
  { to: "/", labelKey: "public.home", icon: Home, end: true },
  { to: "/about", labelKey: "public.about", icon: Info },
  { to: "/funeral-cases", labelKey: "public.funeralCases", icon: Heart },
  { to: "/announcements", labelKey: "public.announcements", icon: Megaphone },
  { to: "/contact", labelKey: "public.contact", icon: Phone },
];

// Secondary nav â€” inside "More" dropdown on desktop; shown in mobile drawer
const secondaryNavLinks = [
  { to: "/membership", labelKey: "public.membership", icon: BookOpen },
  { to: "/committee", labelKey: "public.committee", icon: Users },
  { to: "/donate", labelKey: "public.donate", icon: Banknote },
  { to: "/downloads", labelKey: "public.downloads", icon: Download },
  { to: "/faq", labelKey: "public.faq", icon: HelpCircle },
];

// (primaryNavLinks and secondaryNavLinks are used directly throughout)

export function PublicLayout() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close "More" when route changes
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* â”€â”€ Backdrop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* â”€â”€ Drawer (mobile / tablet) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-72 bg-card flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b shrink-0">
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Noormang Mutual</p>
              <p className="text-xs text-muted-foreground">Committee</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Primary nav links */}
        <nav className="flex flex-col gap-0.5 px-3 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pb-1">
            {t("public.home")}
          </p>
          {primaryNavLinks.map(({ to, labelKey, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in rest ? (rest as { end?: boolean }).end : undefined}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-6 border-t my-1" />

        {/* Secondary nav links */}
        <nav className="flex flex-col gap-0.5 px-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pb-1">
            {t("public.more")}
          </p>
          {secondaryNavLinks.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Drawer footer: admin login */}
        <div className="p-4 border-t shrink-0">
          <Link to="/login" onClick={() => setDrawerOpen(false)}>
            <Button variant="outline" className="w-full gap-2">
              <Shield className="h-4 w-4" />
              {t("public.adminLogin")}
            </Button>
          </Link>
        </div>
      </div>

      {/* â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Heart className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none tracking-tight whitespace-nowrap">
                  Noormang Mutual
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Committee</p>
              </div>
            </Link>

            {/* Desktop nav â€” lg and above only */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {primaryNavLinks.map(({ to, labelKey, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  {t(labelKey)}
                </NavLink>
              ))}

              {/* More dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    moreOpen
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {t("public.more")}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      moreOpen && "rotate-180",
                    )}
                  />
                </button>

                {moreOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-card border rounded-xl shadow-xl py-1.5 z-50">
                    {secondaryNavLinks.map(({ to, labelKey, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                            isActive
                              ? "text-primary font-semibold bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {t(labelKey)}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 shrink-0">
              <LanguageToggle />
              <ThemeToggle />
              <Link to="/login" className="hidden lg:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 ml-1 whitespace-nowrap"
                >
                  <Shield className="h-3.5 w-3.5" />
                  {t("public.adminLogin")}
                </Button>
              </Link>
              {/* Hamburger â€” below lg only */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 xl:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold leading-tight">Noormang Mutual</p>
                  <p className="text-xs text-muted-foreground">Committee</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("public.footerDescription")}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <Heart className="h-3 w-3" />
                {t("public.established")}
              </div>
            </div>

            {/* Quick Links â€“ column 1 (primary) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                {t("public.quickLinks")}
              </h3>
              <ul className="space-y-2">
                {primaryNavLinks.map(({ to, labelKey, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links â€“ column 2 (secondary) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("public.moreLinks")}</h3>
              <ul className="space-y-2">
                {secondaryNavLinks.map(({ to, labelKey, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Portal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                {t("public.management")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("public.footerAdminDesc")}
              </p>
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  {t("public.adminLogin")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Â© {new Date().getFullYear()} Noormang Mutual Committee &mdash;{" "}
              {t("public.footerRights")}
            </span>
            <a
              href="https://www.linkedin.com/in/imrandilshad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              Developed by{" "}
              <span className="font-semibold text-primary">Imran Dilshad</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
