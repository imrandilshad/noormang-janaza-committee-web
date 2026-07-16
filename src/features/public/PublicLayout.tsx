import { useState, useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Menu,
  X,
  Shield,
  ExternalLink,
  Home,
  Megaphone,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Toaster } from "@/components/ui/toaster";

const navLinks = [
  { to: "/", labelKey: "public.home", icon: Home, end: true },
  { to: "/announcements", labelKey: "public.announcements", icon: Megaphone },
  { to: "/funeral-cases", labelKey: "public.funeralCases", icon: Heart },
  { to: "/members", labelKey: "public.members", icon: Users },
];

export function PublicLayout() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Drawer ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-72 bg-card flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
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

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {navLinks.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Footer: admin login only */}
        <div className="p-4 border-t shrink-0">
          <Link to="/login" onClick={() => setDrawerOpen(false)}>
            <Button variant="outline" className="w-full gap-2">
              <Shield className="h-4 w-4" />
              {t("public.adminLogin")}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none tracking-tight">
                  Noormang Mutual
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Committee
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, labelKey, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {t(labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
              <Link to="/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-1.5 ml-1">
                  <Shield className="h-3.5 w-3.5" />
                  {t("public.adminLogin")}
                </Button>
              </Link>
              {/* Hamburger — mobile only */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
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

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main grid */}
          <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
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

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("public.quickLinks")}</h3>
              <ul className="space-y-2.5">
                {navLinks.map(({ to, labelKey, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Portal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("public.management")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Committee administrators can log in to manage members, cases, and announcements.
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
            <span>© {new Date().getFullYear()} Noormang Mutual Committee &mdash; {t("public.footerRights")}</span>
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
