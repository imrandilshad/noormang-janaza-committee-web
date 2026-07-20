import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Home,
  Heart,
  BookOpen,
  Receipt,
  HandCoins,
  Wallet,
  Megaphone,
  BarChart2,
  FolderOpen,
  Globe,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, labelKey: "menu.dashboard" },
  { to: "/admin/families", icon: Home, labelKey: "menu.families" },
  { to: "/admin/members", icon: Users, labelKey: "menu.members" },
  { to: "/admin/funeral-cases", icon: BookOpen, labelKey: "menu.funeralCases" },
  { to: "/admin/expenses", icon: Receipt, labelKey: "menu.expenses" },
  { to: "/admin/collections", icon: HandCoins, labelKey: "menu.collections" },
  { to: "/admin/payments", icon: Wallet, labelKey: "menu.payments" },
  {
    to: "/admin/announcements",
    icon: Megaphone,
    labelKey: "menu.announcements",
  },
  { to: "/admin/reports", icon: BarChart2, labelKey: "menu.reports" },
  { to: "/admin/documents", icon: FolderOpen, labelKey: "menu.documents" },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, language } = useAppStore();
  const isRTL = language === "ur";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-50 h-full w-64 bg-card transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          sidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Janaza Committee</p>
              <p className="text-xs text-muted-foreground">Village Noormang</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-2 overflow-y-auto h-[calc(100vh-65px)]">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(labelKey)}
            </NavLink>
          ))}

          <Separator className="my-1" />

          {/* View public website */}
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <Globe className="h-4 w-4 shrink-0" />
            {t("menu.viewWebsite")}
          </Link>
        </nav>
      </aside>
    </>
  );
}
